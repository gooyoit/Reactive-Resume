import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  RawBodyRequest,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import {
  CheckDownloadLimitDto,
  checkDownloadLimitSchema,
  CreateOrderDto,
  createOrderSchema,
  DownloadLimitResponseDto,
  OrderResponseDto,
  UserWithSecrets,
} from "@reactive-resume/dto";
import type { Request } from "express";
import { ZodValidationPipe } from "nestjs-zod";

import { TwoFactorGuard } from "@/server/auth/guards/two-factor.guard";
import { User } from "@/server/user/decorators/user.decorator";

import { PaymentService } from "./payment.service";

@ApiTags("Payment")
@Controller("payment")
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post("create-order")
  @UseGuards(TwoFactorGuard)
  @ApiBearerAuth()
  async createOrder(
    @User() user: UserWithSecrets,
    @Body(new ZodValidationPipe(createOrderSchema)) createOrderDto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    return this.paymentService.createOrder(user.id, createOrderDto);
  }

  @Get("check-download-limit")
  @UseGuards(TwoFactorGuard)
  @ApiBearerAuth()
  async checkDownloadLimit(
    @User() user: UserWithSecrets,
    @Query(new ZodValidationPipe(checkDownloadLimitSchema)) query: CheckDownloadLimitDto,
  ): Promise<DownloadLimitResponseDto> {
    return this.paymentService.checkDownloadLimit(user.id, query);
  }

  @Get("order-status")
  @UseGuards(TwoFactorGuard)
  @ApiBearerAuth()
  async checkOrderStatus(
    @User() user: UserWithSecrets,
    @Query("outTradeNo") outTradeNo: string,
  ): Promise<{ status: string; transactionId?: string }> {
    return this.paymentService.checkOrderStatus(user.id, outTradeNo);
  }

  @Post("wechat-notify")
  @HttpCode(HttpStatus.OK)
  async wechatNotify(
    @Req() req: RawBodyRequest<Request>,
    @Headers() _headers: Record<string, string>,
  ): Promise<{ code: string; message: string }> {
    try {
      // 微信支付回调验证和处理
      const body = req.rawBody?.toString("utf8");
      if (!body) {
        throw new Error("Empty request body");
      }

      const notifyData = JSON.parse(body);
      await this.paymentService.handlePaymentNotify(notifyData);

      return { code: "SUCCESS", message: "成功" };
    } catch (error) {
      return { code: "FAIL", message: error instanceof Error ? error.message : "处理失败" };
    }
  }

  // 分享支付相关端点
  @Post("create-share-order")
  async createShareOrder(
    @Body() body: { shareToken: string; paymentType: "owner" | "viewer"; userId?: string },
  ): Promise<OrderResponseDto> {
    return this.paymentService.createShareOrder(body.shareToken, body.paymentType, body.userId);
  }

  @Get("check-share-access")
  async checkShareAccess(@Query("shareToken") shareToken: string): Promise<{
    hasAccess: boolean;
    accessType: "none" | "owner_paid" | "viewer_paid";
    remainingDownloads?: number;
  }> {
    return this.paymentService.checkShareAccess(shareToken);
  }

  @Post("record-share-download")
  async recordShareDownload(
    @Body() body: { shareToken: string; downloaderId?: string },
  ): Promise<{ success: boolean }> {
    await this.paymentService.recordShareDownload(body.shareToken, body.downloaderId);
    return { success: true };
  }
}
