// wechat.strategy.ts

import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { User } from "@prisma/client";
import { ErrorMessage } from "@reactive-resume/utils";
import { Strategy, WechatAuthProfile, WechatStrategyOptions } from "passport-wechat";

import { UserService } from "@/server/user/user.service";

@Injectable()
export class WechatStrategy extends PassportStrategy(Strategy, "wechat") {
  constructor(
    readonly clientID: string, // WECHAT_APP_ID
    readonly clientSecret: string, // WECHAT_APP_SECRET
    readonly callbackURL: string, //WECHAT_CALLBACK_URL
    private readonly userService: UserService,
  ) {
    super({ clientID, clientSecret, callbackURL, scope: "snsapi_login" } as WechatStrategyOptions);
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: WechatAuthProfile,
    done: (err?: string | Error | null, user?: Express.User, info?: unknown) => void,
  ) {
    const { openid } = profile.openid;

    let user: User | null = null;

    if (!openid) throw new BadRequestException();

    try {
      const user = await this.userService.findOneByIdentifier(openid);

      if (!user) throw new UnauthorizedException();

      done(null, user);
    } catch (error) {
      try {
        user = await this.userService.create({
          email: "",
          picture: profile.headimgurl,
          locale: "zh-CN",
          name: profile.nickname,
          provider: "wechat",
          emailVerified: false, // auto-verify emails
          username: profile.nickname,
          secrets: { create: {} },
        });

        done(null, user);
      } catch (error) {
        throw new BadRequestException(ErrorMessage.UserAlreadyExists);
      }
    }
  }
  // 生成随机的 state 参数
  public generateState(): string {
    return Math.random().toString(36).substring(7);
  }
}
