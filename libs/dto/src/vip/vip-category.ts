import { idSchema } from "@reactive-resume/schema";
import { createZodDto } from "nestjs-zod/dto";
import { z } from "nestjs-zod/z";

const CategoryEnum = z.enum(["day", "month", "renewal_month", "year", "renewal_year", "forever"]);
// 定义 vipSchema
export const vipCategorySchema = z.object({
  id: idSchema, // 说明‘折合￥10.75/月’
  category: CategoryEnum, //
  name: z.string(), // 会员类型
  tag: z.string(), // 标签‘立减40元’
  price: z.number(), // 原价
  realPrice: z.number(),
  countUnit: z.string().default("d"),
  descs: z.string(), // 描述‘下载次数：全站文档任选，总计3600次，单日限量50次’
  status: z.boolean().default(true),
  createdAt: z.date().or(z.dateString()),
  updatedAt: z.date().or(z.dateString()),
});

export class VipCategoryDto extends createZodDto(vipCategorySchema) {}
