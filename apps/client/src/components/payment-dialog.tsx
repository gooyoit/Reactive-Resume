import { t } from "@lingui/macro";
import { WechatLogo } from "@phosphor-icons/react";
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from "@reactive-resume/ui";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";

import { usePaymentWebSocket } from "@/client/hooks/use-payment-websocket";
import { useCreatePaymentOrder } from "@/client/services/payment";
import { useAuthStore } from "@/client/stores/auth";

type PaymentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resumeId: string;
  onPaymentSuccess?: () => void;
};

export const PaymentDialog = ({
  open,
  onOpenChange,
  resumeId,
  onPaymentSuccess,
}: PaymentDialogProps) => {
  const [orderData, setOrderData] = useState<{
    codeUrl: string;
    outTradeNo: string;
    amount: number;
  } | null>(null);

  const { createOrder, loading } = useCreatePaymentOrder();
  const user = useAuthStore((state) => state.user);

  // WebSocket 连接
  const { connected } = usePaymentWebSocket({
    outTradeNo: orderData?.outTradeNo ?? null,
    userId: user?.id ?? "",
    onPaymentSuccess: () => {
      onPaymentSuccess?.();
    },
  });

  const handleCreateOrder = async () => {
    try {
      const order = await createOrder({ resumeId });
      setOrderData({
        codeUrl: order.codeUrl,
        outTradeNo: order.outTradeNo,
        amount: order.amount,
      });
    } catch {
      // Error is handled by the hook
    }
  };

  // 创建订单
  useEffect(() => {
    if (open && !orderData) {
      void handleCreateOrder();
    }
  }, [open]);

  // 清理订单数据
  const handleClose = (open: boolean) => {
    if (!open) {
      setOrderData(null);
    }
    onOpenChange(open);
  };

  // 模拟支付成功检查（实际项目中应该使用 WebSocket 或轮询）
  useEffect(() => {
    if (!orderData) return;

    const checkPaymentStatus = async () => {
      // 这里应该调用后端API检查支付状态
      // 暂时用模拟的方式
    };

    const interval = setInterval(checkPaymentStatus, 3000);
    return () => {
      clearInterval(interval);
    };
  }, [orderData]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <WechatLogo className="size-5 text-green-600" />
            {t`WeChat Pay`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">¥6.80</div>
            <div className="text-sm text-gray-600">{t`PDF Download Service`}</div>
            <div className="mt-1 text-xs text-gray-500">
              {t`Pay once, download 9 times for the same resume`}
            </div>
          </div>

          {loading && (
            <div className="flex justify-center py-8">
              <div className="text-center">
                <div className="mx-auto mb-2 size-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <div className="text-sm text-gray-600">{t`Creating payment order...`}</div>
              </div>
            </div>
          )}

          {orderData && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="rounded-lg border bg-white p-4">
                  <QRCodeSVG value={orderData.codeUrl} size={200} level="M" />
                </div>
              </div>

              <div className="space-y-2 text-center">
                <div className="font-medium">{t`Scan QR code with WeChat to pay`}</div>
                <div className="text-sm text-gray-600">
                  {t`Order No.`}: {orderData.outTradeNo}
                </div>
                <div className="flex items-center justify-center gap-2 text-xs">
                  <div
                    className={`size-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`}
                  />
                  <span className={connected ? "text-green-600" : "text-red-600"}>
                    {connected ? t`Connected` : t`Connecting...`}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {t`Payment will be processed automatically after scanning`}
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
                <div className="mb-1 font-medium">{t`Payment Instructions:`}</div>
                <ul className="space-y-1">
                  <li>• {t`Each payment allows 9 PDF downloads for this resume`}</li>
                  <li>• {t`Payment is valid permanently, no expiration`}</li>
                  <li>• {t`Refunds available within 24 hours if unused`}</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
