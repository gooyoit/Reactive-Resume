import { Module } from "@nestjs/common";

import { ResumeModule } from "../resume/resume.module";
import { ShareController, SharedController } from "./share.controller";
import { ShareService } from "./share.service";

@Module({
  imports: [ResumeModule],
  controllers: [ShareController, SharedController],
  providers: [ShareService],
  exports: [ShareService],
})
export class ShareModule {}
