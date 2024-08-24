import { createZodDto } from "nestjs-zod/dto";
import { z } from "nestjs-zod/z";

// 定义 vipSchema
export const vipSchema = z.object({
  id: z.number(), // 说明‘折合￥10.75/月’
  text: z.string(), // 说明‘折合￥10.75/月’
  type: z.string(), // 会员类型
  tag: z.string(), // 标签‘立减40元’
  price: z.number(), // 原价
  discountedPrice: z.number(), // 折后价
  description: z.string(), // 描述‘下载次数：全站文档任选，总计3600次，单日限量50次’
});

export class VipDto extends createZodDto(vipSchema) {
  vip: any;
}
