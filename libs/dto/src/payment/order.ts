import { z } from "zod";

export const createOrderSchema = z.object({
  resumeId: z.string().cuid(),
});

export const orderResponseSchema = z.object({
  id: z.string().cuid(),
  outTradeNo: z.string(),
  codeUrl: z.string(), // 微信支付二维码链接
  amount: z.number().int().positive(),
  status: z.enum(["pending", "paid", "cancelled", "refunded"]),
  createdAt: z.date(),
});

export const checkDownloadLimitSchema = z.object({
  resumeId: z.string().cuid(),
});

export const downloadLimitResponseSchema = z.object({
  canDownload: z.boolean(),
  remainingDownloads: z.number().int().min(0),
  orderId: z.string().cuid().optional(),
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;
export type OrderResponseDto = z.infer<typeof orderResponseSchema>;
export type CheckDownloadLimitDto = z.infer<typeof checkDownloadLimitSchema>;
export type DownloadLimitResponseDto = z.infer<typeof downloadLimitResponseSchema>;
