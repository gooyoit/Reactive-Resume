import { Module } from "@nestjs/common";

import { PaymentController } from "./payment.controller";
import { PaymentGateway } from "./payment.gateway";
import { PaymentService } from "./payment.service";

@Module({
  controllers: [PaymentController],
  providers: [PaymentService, PaymentGateway],
  exports: [PaymentService, PaymentGateway],
})
export class PaymentModule {}
