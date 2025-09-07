import { readFileSync } from "node:fs";

import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type {
  CheckDownloadLimitDto,
  CreateOrderDto,
  DownloadLimitResponseDto,
  OrderResponseDto,
} from "@reactive-resume/dto";
import { PrismaService } from "nestjs-prisma";
import WechatPay from "wechatpay-node-v3";

import type { Config } from "@/server/config/schema";

import { PaymentGateway } from "./payment.gateway";

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly wechatPay: WechatPay;
  private readonly DOWNLOAD_LIMIT = 9;
  private readonly PAYMENT_AMOUNT = 680; // 6.8元 = 680分
  private readonly SHARE_PAYMENT_AMOUNT = 50; // 0.5元 = 50分

  constructor(
    private readonly configService: ConfigService<Config>,
    private readonly prismaService: PrismaService,
    private readonly paymentGateway: PaymentGateway,
  ) {
    const appId = this.configService.get("WECHAT_PAY_APPID");
    const mchId = this.configService.get("WECHAT_PAY_MCHID");
    const serialNo = this.configService.get("WECHAT_PAY_SERIAL_NO");
    const privateKeyPath = this.configService.get("WECHAT_PAY_PRIVATE_KEY_PATH");
    const apiKey = this.configService.get("WECHAT_PAY_APIV3_KEY");

    if (!appId || !mchId || !serialNo || !privateKeyPath || !apiKey) {
      this.logger.warn("WeChat Pay configuration is incomplete");
      return;
    }

    try {
      let privateKey;

      // 检查是文件路径还是直接的私钥内容
      if (privateKeyPath.startsWith("/") || privateKeyPath.includes("\\")) {
        // 是文件路径，读取文件内容
        try {
          privateKey = readFileSync(privateKeyPath, "utf8");
        } catch (error) {
          this.logger.error(`Failed to read private key file: ${privateKeyPath}`, error);
          throw error;
        }
      } else if (privateKeyPath.includes("-----BEGIN")) {
        // 是私钥内容
        privateKey = privateKeyPath;
        this.logger.log("Using private key content directly");
      } else {
        throw new Error("Invalid private key format. Must be either file path or PEM content");
      }

      this.wechatPay = new WechatPay({
        appid: appId,
        mchid: mchId,
        serial_no: serialNo,
        publicKey: Buffer.from(""), // 微信支付平台证书公钥，初始化时可为空
        privateKey,
        key: apiKey,
      });

      this.logger.log("WeChat Pay service initialized successfully");
    } catch (error) {
      this.logger.error("Failed to initialize WeChat Pay service", error);
    }
  }

  async createOrder(userId: string, data: CreateOrderDto): Promise<OrderResponseDto> {
    if (!this.wechatPay) {
      throw new Error("WeChat Pay service is not available");
    }

    // 生成商户订单号
    const outTradeNo = `PDF_${Date.now()}_${userId.slice(-6)}`;

    try {
      // 创建订单记录
      const order = await this.prismaService.order.create({
        data: {
          outTradeNo,
          amount: this.PAYMENT_AMOUNT,
          resumeId: data.resumeId,
          userId,
          status: "pending",
        },
      });

      // 调用微信支付Native下单API
      const appId = this.configService.get("WECHAT_PAY_APPID");
      const mchId = this.configService.get("WECHAT_PAY_MCHID");
      const notifyUrl = this.configService.get("WECHAT_PAY_NOTIFY_URL");

      if (!appId || !mchId || !notifyUrl) {
        throw new Error("WeChat Pay configuration is incomplete");
      }

      const result = await this.wechatPay.transactions_native({
        appid: appId,
        mchid: mchId,
        description: "简历PDF下载服务",
        out_trade_no: outTradeNo,
        notify_url: notifyUrl,
        amount: {
          total: this.PAYMENT_AMOUNT,
        },
        attach: `resumeId:${data.resumeId}|userId:${userId}`,
      });

      this.logger.log(`Order created: ${outTradeNo}`, result);

      return {
        id: order.id,
        outTradeNo: order.outTradeNo,
        codeUrl: (result as unknown as { code_url: string }).code_url,
        amount: order.amount,
        status: order.status,
        createdAt: order.createdAt,
      };
    } catch (error) {
      this.logger.error(`Failed to create order: ${outTradeNo}`, error);
      throw error;
    }
  }

  async checkDownloadLimit(
    userId: string,
    data: CheckDownloadLimitDto,
  ): Promise<DownloadLimitResponseDto> {
    // 首先检查用户的免费下载次数
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { freeDownloads: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // 如果用户有免费下载次数，检查已使用的免费下载次数
    if (user.freeDownloads > 0) {
      const freeDownloadCount = await this.prismaService.download.count({
        where: {
          userId,
          isFree: true,
        },
      });

      if (freeDownloadCount < user.freeDownloads) {
        return {
          canDownload: true,
          remainingDownloads: user.freeDownloads - freeDownloadCount,
          orderId: undefined, // 免费下载不需要orderId
        };
      }
    }

    // 免费次数用完或没有免费次数，检查付费订单
    const paidOrders = await this.prismaService.order.findMany({
      where: {
        userId,
        resumeId: data.resumeId,
        status: "paid",
      },
      include: {
        downloads: {
          where: {
            isFree: false, // 只统计付费下载
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 检查是否有可用的付费订单
    for (const order of paidOrders) {
      const downloadCount = order.downloads.length;
      if (downloadCount < this.DOWNLOAD_LIMIT) {
        return {
          canDownload: true,
          remainingDownloads: this.DOWNLOAD_LIMIT - downloadCount,
          orderId: order.id,
        };
      }
    }

    return {
      canDownload: false,
      remainingDownloads: 0,
    };
  }

  async recordDownload(userId: string, resumeId: string, orderId?: string): Promise<void> {
    const isFree = !orderId; // 没有orderId说明是免费下载

    await this.prismaService.download.create({
      data: {
        orderId: orderId ?? null,
        userId,
        resumeId,
        isFree,
      },
    });

    this.logger.log(
      `Download recorded: user=${userId}, resume=${resumeId}, order=${orderId ?? "free"}, isFree=${isFree}`,
    );
  }

  async checkOrderStatus(
    userId: string,
    outTradeNo: string,
  ): Promise<{ status: string; transactionId?: string }> {
    const order = await this.prismaService.order.findFirst({
      where: {
        outTradeNo,
        userId,
      },
      select: {
        status: true,
        transactionId: true,
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    return {
      status: order.status,
      transactionId: order.transactionId ?? undefined,
    };
  }

  async handlePaymentNotify(notifyData: unknown): Promise<void> {
    try {
      // 验证微信支付回调签名
      const notify = notifyData as {
        resource: {
          ciphertext: string;
          associated_data: string;
          nonce: string;
        };
      };

      const apiKey = this.configService.get("WECHAT_PAY_APIV3_KEY");
      if (!apiKey) {
        throw new Error("WeChat Pay API key is not configured");
      }

      const resource = this.wechatPay.decipher_gcm(
        notify.resource.ciphertext,
        notify.resource.associated_data,
        notify.resource.nonce,
        apiKey,
      );

      const paymentResult = JSON.parse(resource as string) as {
        trade_state: string;
        out_trade_no: string;
        transaction_id: string;
      };

      if (paymentResult.trade_state === "SUCCESS") {
        // 更新订单状态
        await this.prismaService.order.update({
          where: {
            outTradeNo: paymentResult.out_trade_no,
          },
          data: {
            status: "paid",
            transactionId: paymentResult.transaction_id,
          },
        });

        this.logger.log(`Payment successful: ${paymentResult.out_trade_no}`);

        // 通过WebSocket通知前端支付成功
        this.paymentGateway.notifyPaymentStatusUpdate({
          outTradeNo: paymentResult.out_trade_no,
          status: "paid",
          transactionId: paymentResult.transaction_id,
        });
      }
    } catch (error) {
      this.logger.error("Failed to handle payment notify", error);
      throw error;
    }
  }

  // 2.0版本分享支付功能
  async createShareOrder(
    shareToken: string,
    paymentType: "owner" | "viewer",
    userId?: string,
  ): Promise<OrderResponseDto> {
    if (!this.wechatPay) {
      throw new Error("WeChat Pay service is not available");
    }

    // 获取分享信息
    const share = await this.prismaService.share.findUnique({
      where: { shareToken },
      include: {
        owner: {
          select: { id: true, name: true },
        },
      },
    });

    if (!share?.isActive) {
      throw new Error("Share not found or expired");
    }

    // 根据支付类型确定金额和描述
    const amount = paymentType === "owner" ? this.PAYMENT_AMOUNT : this.SHARE_PAYMENT_AMOUNT;
    const description =
      paymentType === "owner" ? "简历分享访问服务(所有者付费)" : "简历单次预览服务(访问者付费)";

    // 生成商户订单号
    const outTradeNo = `SHARE_${paymentType.toUpperCase()}_${Date.now()}_${share.id.slice(-6)}`;

    try { 
      // 创建订单记录
      const order = await this.prismaService.order.create({
        data: {
          outTradeNo,
          amount,
          resumeId: share.resumeId,
          userId: paymentType === "owner" ? share.ownerId : (userId ?? null),
          shareId: share.id,
          status: "pending",
          type: paymentType === "owner" ? "owner" : "share",
        },
      });

      // 调用微信支付Native下单API
      const appId = this.configService.get("WECHAT_PAY_APPID");
      const mchId = this.configService.get("WECHAT_PAY_MCHID");
      const notifyUrl = this.configService.get("WECHAT_PAY_NOTIFY_URL");

      if (!appId || !mchId || !notifyUrl) {
        throw new Error("WeChat Pay configuration is incomplete");
      }

      const result = await this.wechatPay.transactions_native({
        appid: appId,
        mchid: mchId,
        description,
        out_trade_no: outTradeNo,
        notify_url: notifyUrl,
        amount: {
          total: amount,
        },
        attach: `shareId:${share.id}|resumeId:${share.resumeId}|paymentType:${paymentType}`,
      });

      this.logger.log(`Share order created: ${outTradeNo}`, result);

      return {
        id: order.id,
        outTradeNo: order.outTradeNo,
        codeUrl: (result as unknown as { code_url: string }).code_url,
        amount: order.amount,
        status: order.status,
        createdAt: order.createdAt,
      };
    } catch (error) {
      this.logger.error(`Failed to create share order: ${outTradeNo}`, error);
      throw error;
    }
  }

  async checkShareAccess(shareToken: string): Promise<{
    hasAccess: boolean;
    accessType: "none" | "owner_paid" | "viewer_paid";
    remainingDownloads?: number;
  }> {
    const share = await this.prismaService.share.findUnique({
      where: { shareToken },
      include: {
        orders: {
          where: { status: "paid" },
          include: {
            downloads: true,
          },
        },
      },
    });

    if (!share?.isActive) {
      return { hasAccess: false, accessType: "none" };
    }

    // 检查是否有已支付的订单
    const paidOwnerOrder = share.orders.find((order) => order.type === "owner");
    const paidViewerOrder = share.orders.find((order) => order.type === "share");

    if (paidOwnerOrder) {
      // 所有者付费，检查下载次数限制
      const downloadCount = paidOwnerOrder.downloads.length;
      const remaining = this.DOWNLOAD_LIMIT - downloadCount;

      return {
        hasAccess: remaining > 0,
        accessType: "owner_paid",
        remainingDownloads: Math.max(0, remaining),
      };
    }

    if (paidViewerOrder) {
      // 访问者付费，只允许1次下载
      const downloadCount = paidViewerOrder.downloads.length;

      return {
        hasAccess: downloadCount === 0,
        accessType: "viewer_paid",
        remainingDownloads: downloadCount === 0 ? 1 : 0,
      };
    }

    return { hasAccess: false, accessType: "none" };
  }

  async recordShareDownload(shareToken: string, downloaderId?: string): Promise<void> {
    const accessInfo = await this.checkShareAccess(shareToken);

    if (!accessInfo.hasAccess) {
      throw new Error("No access to download this shared resume");
    }

    const share = await this.prismaService.share.findUnique({
      where: { shareToken },
      include: {
        orders: {
          where: { status: "paid" },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!share) {
      throw new Error("Share not found");
    }

    // 找到相应的已支付订单
    const order =
      accessInfo.accessType === "owner_paid"
        ? share.orders.find((o) => o.type === "owner")
        : share.orders.find((o) => o.type === "share");

    if (!order) {
      throw new Error("No valid paid order found");
    }

    // 创建下载记录
    await this.prismaService.download.create({
      data: {
        orderId: order.id,
        userId: downloaderId ?? null,
        resumeId: share.resumeId,
        shareId: share.id,
        type:
          accessInfo.accessType === "owner_paid" ? "share_paid_by_owner" : "share_paid_by_viewer",
        isFree: false,
      },
    });

    this.logger.log(
      `Share download recorded: share=${shareToken}, downloader=${downloaderId ?? "anonymous"}, type=${accessInfo.accessType}`,
    );
  }
}
