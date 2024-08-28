import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { TwoFactorGuard } from "../auth/guards/two-factor.guard";
import { VipService } from "./vip.service";
@ApiTags("Vip")
@Controller("vip")
export class VipController {
  constructor(private readonly vipService: VipService) {}

  @Get("categories")
  @UseGuards(TwoFactorGuard)
  findOneStatistics() {
    return this.vipService.findCategories(true);
  }
}
