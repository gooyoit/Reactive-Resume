import { t } from "@lingui/macro";
import { WechatLogo } from "@phosphor-icons/react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@reactive-resume/ui";
import { useMutation } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";

import { usePaymentWebSocket } from "@/client/hooks/use-payment-websocket";
import { useToast } from "@/client/hooks/use-toast";
import { createShareOrder } from "@/client/services/share";

type SharePaymentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareToken: string;
  paymentType: "owner" | "viewer";
  onPaymentSuccess: () => void;
};

export const SharePaymentDialog = ({
  open,
  onOpenChange,
  shareToken,
  paymentType,
  onPaymentSuccess,
}: SharePaymentDialogProps) => {
  const { toast } = useToast();
  const [orderData, setOrderData] = useState<{
    codeUrl: string;
    outTradeNo: string;
    amount: number;
  } | null>(null);

  // WebSocket connection for payment status
  const { connected } = usePaymentWebSocket({
    outTradeNo: orderData?.outTradeNo ?? null,
    userId: "", // Anonymous for viewer payments
    onPaymentSuccess: () => {
      onPaymentSuccess();
      onOpenChange(false);
      // Reset state
      setOrderData(null);
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: createShareOrder,
    onSuccess: (data) => {
      setOrderData({
        codeUrl: data.codeUrl,
        outTradeNo: data.outTradeNo,
        amount: data.amount,
      });
      toast({
        variant: "success",
        title: t`支付订单已创建`,
        description: t`请使用微信扫描二维码完成支付`,
      });
    },
    onError: () => {
      toast({
        variant: "error",
        title: t`创建支付订单失败`,
        description: t`请稍后重试`,
      });
    },
  });

  const handleStartPayment = () => {
    createOrderMutation.mutate({
      shareToken,
      paymentType,
      // 对于viewer类型支付，可以传递匿名用户标识或不传
    });
  };

  const getPaymentInfo = () => {
    return paymentType === "owner"
      ? {
          title: t`所有者付费`,
          description: t`支付 ¥6.8 后，访问者可多次下载您的简历`,
          amount: "¥6.8",
        }
      : {
          title: t`访问者付费`,
          description: t`支付以获得临时预览下载权限，您也可以通知简历分享人付费后获得预览和下载权限`,
          amount: "¥0.5",
        };
  };

  const paymentInfo = getPaymentInfo();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <WechatLogo className="size-5 text-green-600" />
            {paymentInfo.title}
          </DialogTitle>
          <DialogDescription>{paymentInfo.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center">
            <div className="mb-2 text-2xl font-bold text-primary">{paymentInfo.amount}</div>
          </div>

          {orderData ? (
            <div className="space-y-4 text-center">
              <div className="flex flex-col items-center space-y-4">
                <QRCodeSVG value={orderData.codeUrl} size={200} />
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <WechatLogo size={20} />
                  <span>{t`请使用微信扫码支付`}</span>
                </div>
                {connected && (
                  <div className="text-xs text-green-600">{t`支付监控已连接，完成支付后将自动跳转`}</div>
                )}
              </div>
            </div>
          ) : (
            <Button
              className="w-full"
              disabled={createOrderMutation.isPending}
              onClick={handleStartPayment}
            >
              {createOrderMutation.isPending ? t`创建订单中...` : t`确认支付`}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
