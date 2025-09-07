import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import type { User as UserType } from "@prisma/client";

import { TwoFactorGuard } from "@/server/auth/guards/two-factor.guard";
import { ResumeService } from "@/server/resume/resume.service";
import { User } from "@/server/user/decorators/user.decorator";

import { ShareService } from "./share.service";

@UseGuards(TwoFactorGuard)
@Controller("share")
export class ShareController {
  constructor(private readonly shareService: ShareService) {}

  @Post()
  async createShare(@Body() dto: { resumeId: string }, @User() user: UserType) {
    return await this.shareService.createShare(dto.resumeId, user.id);
  }

  @Get("resume/:resumeId")
  async getResumeShares(@Param("resumeId") resumeId: string, @User() user: UserType) {
    return await this.shareService.findByResumeAndOwner(resumeId, user.id);
  }

  @Delete(":shareId")
  async deactivateShare(@Param("shareId") shareId: string, @User() user: UserType) {
    return await this.shareService.deactivateShare(shareId, user.id);
  }
}

// 公开接口，用于通过分享令牌访问简历
@Controller("shared")
export class SharedController {
  constructor(
    private readonly shareService: ShareService,
    private readonly resumeService: ResumeService,
  ) {}

  @Get(":shareToken")
  async getSharedResume(@Param("shareToken") shareToken: string) {
    const share = await this.shareService.findByToken(shareToken);
    if (!share?.isActive) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: "分享链接不存在或已过期",
          error: "Not Found",
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // 获取完整的简历数据
    const resume = await this.resumeService.findOne(share.resumeId);

    return {
      share,
      resume,
    };
  }
}
