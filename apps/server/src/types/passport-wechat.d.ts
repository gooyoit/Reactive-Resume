declare module 'passport-wechat' {
  import { Strategy as PassportStrategy } from 'passport';

  interface WechatStrategyOptions {
    appID: string;
    appSecret: string;
    callbackURL: string;
    scope?: string;
    state?: string;
  }

  interface WechatProfile {
    openid: string;
    nickname?: string;
    sex?: number;
    province?: string;
    city?: string;
    country?: string;
    headimgurl?: string;
    privilege?: string[];
    unionid?: string;
  }

  export class Strategy extends PassportStrategy {
    constructor(
      options: WechatStrategyOptions,
      verify: (
        accessToken: string,
        refreshToken: string,
        profile: WechatProfile,
        done: (error: any, user?: any, info?: any) => void,
      ) => void,
    );
  }
}
