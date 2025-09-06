# 微信网站应用授权登录集成

## 概述

本项目已集成微信网站应用授权登录功能，基于微信开放平台的 OAuth2.0 协议实现。

## 配置要求

### 1. 微信开放平台配置

1. 在 [微信开放平台](https://open.weixin.qq.com/) 注册开发者账号
2. 创建网站应用，获得 AppID 和 AppSecret
3. 配置授权回调域名

### 2. 环境变量配置

在 `.env` 文件中添加以下配置：

```bash
# 微信应用配置
WECHAT_CLIENT_ID=your_WECHAT_CLIENT_ID
WECHAT_CLIENT_SECRET=your_WECHAT_CLIENT_SECRET
WECHAT_CALLBACK_URL=https://yourdomain.com/auth/wechat/callback
FRONTEND_URL=https://yourdomain.com
```

## API 接口

### 1. 获取微信登录二维码

```
GET /auth/wechat/qr
```

返回包含微信登录二维码的 HTML 页面。

### 2. 微信登录

```
GET /auth/wechat/login
```

重定向到微信授权页面。

### 3. 微信登录回调

```
GET /auth/wechat/callback
```

处理微信授权回调，返回用户信息。

## 前端集成

### 1. 登录按钮

```html
<a href="/auth/wechat/login" class="wechat-login-btn">
  微信登录
</a>
```

### 2. 二维码登录

```html
<iframe src="/auth/wechat/qr" width="300" height="400"></iframe>
```

### 3. 处理回调

```javascript
// 监听 URL 参数变化
const urlParams = new URLSearchParams(window.location.search);
const provider = urlParams.get('provider');
const success = urlParams.get('success');

if (provider === 'wechat' && success === 'true') {
  // 登录成功，跳转到用户页面
  window.location.href = '/dashboard';
} else if (provider === 'wechat' && urlParams.get('error')) {
  // 登录失败，显示错误信息
  console.error('微信登录失败:', urlParams.get('error'));
}
```

## 技术实现

### 1. 策略类

- `WechatStrategy`: 继承自 Passport 策略，处理微信 OAuth 流程
- 支持 `snsapi_login` 作用域
- 自动创建或更新用户信息

### 2. 用户管理

- 微信用户使用 `openid` 作为唯一标识
- 自动生成邮箱格式：`{openid}@wechat.com`
- 支持 `unionid` 关联（如果用户授权）

### 3. 安全特性

- 使用 `state` 参数防止 CSRF 攻击
- 支持 HTTPS 回调
- 自动验证用户身份

## 注意事项

1. **域名配置**: 确保回调域名在微信开放平台正确配置
2. **HTTPS**: 生产环境必须使用 HTTPS
3. **用户数据**: 微信用户数据仅包含基本信息，不包含邮箱
4. **错误处理**: 实现完善的错误处理和用户提示

## 故障排除

### 常见问题

1. **"该链接无法访问"**
   - 检查 `redirect_uri` 域名是否与审核时一致
   - 确认 `scope` 为 `snsapi_login`

2. **授权失败**
   - 检查 AppID 和 AppSecret 是否正确
   - 确认应用是否已通过审核

3. **回调错误**
   - 检查回调 URL 格式
   - 确认域名白名单配置

## 参考文档

- [微信开放平台文档](https://developers.weixin.qq.com/doc/oplatform/developers/dev/auth/web.html)
- [Passport.js 微信策略](https://github.com/liyuncx/passport-wechat)
