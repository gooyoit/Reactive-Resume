import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { User } from "@prisma/client";
import { ErrorMessage } from "@reactive-resume/utils";
import { Strategy, WechatProfile, WechatStrategyOptions } from "passport-wechat";

import { UserService } from "@/server/user/user.service";

@Injectable()
export class WechatStrategy extends PassportStrategy(Strategy, "wechat") {
  constructor(
    readonly appID: string,
    readonly appSecret: string,
    readonly callbackURL: string,
    private readonly userService: UserService,
  ) {
    super({ appID, appSecret, callbackURL, scope: "snsapi_login" } as WechatStrategyOptions);
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: WechatProfile,
    done: (err?: string | Error | null, user?: Express.User, info?: unknown) => void,
  ) {
    const { openid, nickname, headimgurl, emails } = profile;

    const email = emails?.[0].value ?? `${openid}@github.com`;
    const picture = headimgurl;

    let user: User | null = null;

    //nif (!email || !username) throw new BadRequestException();

    try {
      const user = await this.userService.findOneByIdentifier(email);

      if (!user) throw new UnauthorizedException();

      done(null, user);
    } catch (error) {
      try {
        user = await this.userService.create({
          email,
          picture,
          locale: "en-US",
          name: nickname,
          provider: "github",
          emailVerified: false, // auto-verify emails
          username: nickname,
          secrets: { create: {} },
        });

        done(null, user);
      } catch (error) {
        throw new BadRequestException(ErrorMessage.UserAlreadyExists);
      }
    }
  }
}
