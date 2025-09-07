import { Module } from "@nestjs/common";

import { AuthModule } from "@/server/auth/auth.module";
import { PaymentModule } from "@/server/payment/payment.module";
import { PrinterModule } from "@/server/printer/printer.module";

import { StorageModule } from "../storage/storage.module";
import { ResumeController } from "./resume.controller";
import { ResumeService } from "./resume.service";

@Module({
  imports: [AuthModule, PaymentModule, PrinterModule, StorageModule],
  controllers: [ResumeController],
  providers: [ResumeService],
  exports: [ResumeService],
})
export class ResumeModule {}
