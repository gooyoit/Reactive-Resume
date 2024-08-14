import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";

import { OpenaiController } from "./openai.controller";
import { OpenaiService } from "./openai.service";

@Module({
  imports: [HttpModule],
  controllers: [OpenaiController],
  providers: [OpenaiService],
})
export class OpenaiModule {}
