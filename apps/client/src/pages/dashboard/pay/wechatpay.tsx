import { t } from "@lingui/macro";
import React, { useEffect, useState } from "react";

import { useToast } from "@/client/hooks/use-toast";

type WeChatPayProps = {
  realPrice: number;
  selectedCardId: string | null;
};

export const WeChatPay: React.FC<WeChatPayProps> = ({ realPrice, selectedCardId }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (selectedCardId) {
      // 调用服务端接口获取微信支付二维码
      fetch(`/api/wechatpay?amount=${realPrice}&id=${selectedCardId}`)
        .then((response) => response.json())
        .then((data) => {
          setQrCodeUrl(data.qrCodeUrl);
        })
        .catch((_error: unknown) => {
          toast({
            variant: "error",
            title: t`Payment Error`,
            description: t`Failed to load WeChat Pay QR code. Please try again.`,
          });
        });
    }
  }, [realPrice, selectedCardId]);

  if (!selectedCardId) return null;

  return (
    <div className="rounded-lg bg-white p-6 shadow-lg">
      <h3 className="mb-4 text-lg font-medium">微信支付</h3>
      <img src={qrCodeUrl} alt="WeChat Pay QR Code" className="mx-auto mb-4" />
      <p className="text-center text-lg">{t`Payment Amount: ¥${realPrice}`}</p>
      <div className="mt-4 border-t pt-2 text-xs text-gray-500">
        <p>请扫码支付。</p>
        <p>
          支付即代表您同意我们的{" "}
          <a href="/terms" className="text-blue-500 underline">
            用户协议
          </a>
          。
        </p>
      </div>
    </div>
  );
};
