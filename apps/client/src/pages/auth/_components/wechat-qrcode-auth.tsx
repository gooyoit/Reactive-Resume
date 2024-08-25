import { t } from "@lingui/macro";

export const WechatQrcodeAuth = () => {
  const authUrl = "/api/auth/wechat";
  return (
    <div
      className="w-full sm:h-80"
      style={{ overflow: "hidden", position: "relative", height: "329px" }}
    >
      <iframe
        className="w-full"
        scrolling="no"
        title={t`Wechat_Login`}
        width="100%"
        height="340"
        style={{ top: "-40px", position: "relative" }}
        sandbox="allow-scripts allow-same-origin allow-top-navigation"
        src={authUrl}
      ></iframe>
    </div>
  );
};
