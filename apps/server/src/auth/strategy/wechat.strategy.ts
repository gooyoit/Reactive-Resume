import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { User } from "@prisma/client";
import { ErrorMessage, generateRandomName, processUsername } from "@reactive-resume/utils";
import { Strategy } from "passport-wechat";

import { UserService } from "@/server/user/user.service";

type WechatProfile = {
  openid: string;
  nickname?: string;
  sex?: number;
  province?: string;
  city?: string;
  country?: string;
  headimgurl?: string;
  privilege?: string[];
  unionid?: string;
};

@Injectable()
export class WechatStrategy extends PassportStrategy(Strategy, "wechat") {
  constructor(
    readonly appId: string,
    readonly appSecret: string,
    readonly callbackURL: string,
    private readonly userService: UserService,
  ) {
    super({
      appID: appId,
      appSecret,
      callbackURL,
      scope: "snsapi_login", // 微信网站应用授权登录作用域
      state: "wechat_login", // 防止CSRF攻击的状态参数
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: WechatProfile,
    done: (err?: string | Error | null, user?: Express.User, info?: unknown) => void,
  ) {
    try {
      const { openid, nickname, headimgurl, unionid } = profile;

      // 生成唯一标识符
      const uniqueId = generateRandomName({ length: 2, style: "lowerCase", separator: "-" });

      // 微信用户没有邮箱，使用openid生成唯一邮箱
      const email = `${openid}@wechat.com`;
      const picture = headimgurl;
      const displayName = nickname ?? `微信用户_${uniqueId}`;

      let user: User | null = null;

      try {
        // 首先尝试通过openid查找用户
        user = await this.userService.findOneByIdentifier(openid);

        if (
          !user && // 如果没找到，尝试通过unionid查找（如果有的话）
          unionid
        ) {
          user = await this.userService.findOneByIdentifier(unionid);
        }

        if (user) {
          // 用户存在，更新最后登录时间
          await this.userService.updateByEmail(user.email, {
            updatedAt: new Date(),
          });

          done(null, user);
          return;
        }

        // 用户不存在，创建新用户
        user = await this.userService.create({
          email,
          picture,
          locale: "zh-CN", // 微信用户默认中文
          provider: "wechat",
          name: displayName,
          emailVerified: true, // 微信用户自动验证
          username: processUsername(displayName),
          secrets: { create: {} },
        });

        done(null, user);
      } catch (error) {
        Logger.error(`Error in WechatStrategy validate: ${error}`);
        throw new BadRequestException(ErrorMessage.UserAlreadyExists);
      }
    } catch (error) {
      Logger.error(`WechatStrategy validation failed: ${error}`);
      done(error as Error);
    }
  }
}
