import { Injectable } from "@nestjs/common";
import { createId } from "@paralleldrive/cuid2";
import { PrismaService } from "nestjs-prisma";

@Injectable()
export class ShareService {
  constructor(private readonly prisma: PrismaService) {}

  async createShare(resumeId: string, ownerId: string) {
    const shareToken = createId(); // 生成唯一分享令牌

    const share = await this.prisma.share.create({
      data: {
        shareToken,
        resumeId,
        ownerId,
      },
    });

    return share;
  }

  async findByToken(shareToken: string) {
    return await this.prisma.share.findUnique({
      where: { shareToken },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });
  }

  async findByResumeAndOwner(resumeId: string, ownerId: string) {
    return await this.prisma.share.findMany({
      where: { resumeId, ownerId, isActive: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async deactivateShare(shareId: string, _ownerId: string) {
    return await this.prisma.share.update({
      where: { id: shareId },
      data: { isActive: false },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });
  }
}
