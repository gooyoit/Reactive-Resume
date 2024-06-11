export const WechatQrcodeAuth = () => {
  return (
    <div className="">
      <iframe
        title="wechat_login"
        className=""
        width="100%"
        height="359"
        sandbox="allow-scripts allow-same-origin allow-top-navigation"
        src="/api/auth/wechat"
      ></iframe>
    </div>
  );
};
