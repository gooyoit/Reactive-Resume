import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";

import { VipController } from "./vip.controller";
import { VipService } from "./vip.service";

@Module({
  imports: [HttpModule],
  controllers: [VipController],
  providers: [VipService],
})
export class VipModule {}
