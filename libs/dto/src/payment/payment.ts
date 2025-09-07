import { z } from "zod";

export const wechatNotifySchema = z.object({
  id: z.string(),
  create_time: z.string(),
  resource_type: z.string(),
  event_type: z.string(),
  summary: z.string(),
  resource: z.object({
    original_type: z.string(),
    algorithm: z.string(),
    ciphertext: z.string(),
    associated_data: z.string().optional(),
    nonce: z.string(),
  }),
});

export const wechatPaymentResultSchema = z.object({
  mchid: z.string(),
  appid: z.string(),
  out_trade_no: z.string(),
  transaction_id: z.string(),
  trade_type: z.string(),
  trade_state: z.string(),
  trade_state_desc: z.string(),
  bank_type: z.string(),
  attach: z.string().optional(),
  success_time: z.string(),
  payer: z.object({
    openid: z.string(),
  }),
  amount: z.object({
    total: z.number(),
    payer_total: z.number().optional(),
    currency: z.string().optional(),
    payer_currency: z.string().optional(),
  }),
});

export type WechatNotifyDto = z.infer<typeof wechatNotifySchema>;
export type WechatPaymentResultDto = z.infer<typeof wechatPaymentResultSchema>;
