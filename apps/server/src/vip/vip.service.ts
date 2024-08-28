import { Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";

@Injectable()
export class VipService {
  constructor(private readonly prisma: PrismaService) {}

  findCategories(status: boolean) {
    return this.prisma.vipCategory.findMany({
      where: { status: status },
      orderBy: { updatedAt: "desc" },
    });
  }
}
