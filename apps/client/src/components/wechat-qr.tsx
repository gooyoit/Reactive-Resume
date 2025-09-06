import { t } from "@lingui/macro";
import { useEffect, useMemo, useRef } from "react";

type WechatQRProps = {
  appId: string;
  redirectUri: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
};

/* eslint-disable @typescript-eslint/consistent-type-definitions */
declare global {
  interface Window {
    WxLogin?: new (config: {
      id: string;
      appid: string;
      scope?: string; // snsapi_login
      redirect_uri: string; // should be url-encoded
      state?: string;
      style?: "black" | "white";
      href?: string;
    }) => void;
  }
}
/* eslint-enable @typescript-eslint/consistent-type-definitions */

export const WechatQR = ({ appId, redirectUri, onSuccess, onError }: WechatQRProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate a random state parameter for CSRF protection
  const state = useMemo(() => {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }, []);

  useEffect(() => {
    const initWechatLogin = () => {
      if (!containerRef.current || typeof window.WxLogin !== "function") return;

      try {
        const encodedRedirect = encodeURIComponent(redirectUri);

        // Clear any previous render
        containerRef.current.innerHTML = "";

        // Render QR
        const WxLoginCtor = window.WxLogin as unknown as new (config: {
          id: string;
          appid: string;
          scope?: string;
          redirect_uri: string;
          state?: string;
          style?: "black" | "white";
          href?: string;
        }) => void;

        new WxLoginCtor({
          id: containerRef.current.id,
          appid: appId,
          scope: "snsapi_login",
          redirect_uri: encodedRedirect,
          state: state,
          style: "black",
          href: "",
        });

        onSuccess?.();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : t`Failed to initialize WeChat login`;
        onError?.(message);
      }
    };

    const loadWechatSDK = () => {
      if (typeof window.WxLogin === "function") {
        initWechatLogin();
        return () => {
          // no cleanup necessary when SDK already loaded
          void 0;
        };
      }

      const script = document.createElement("script");
      script.src = "https://res.wx.qq.com/connect/zh_CN/htmledition/js/wxLogin.js";
      script.async = true;
      script.addEventListener("load", initWechatLogin);
      script.addEventListener("error", () => onError?.(t`Failed to load WeChat SDK`));
      document.head.append(script);

      return () => {
        script.removeEventListener("load", initWechatLogin);
      };
    };

    const cleanup = loadWechatSDK();

    return () => {
      cleanup();
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [appId, redirectUri, onError, onSuccess, state]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">{t`WeChat QR Login`}</h3>
        <p className="text-sm text-gray-600">{t`Scan the QR code with WeChat to sign in`}</p>
      </div>

      <div ref={containerRef} id="wechat-qr-container" className="rounded-lg border bg-white p-4" />

      <div className="max-w-xs text-center text-xs text-gray-500">
        {t`Use WeChat to scan and confirm authorization to continue`}
      </div>
    </div>
  );
};
