import { createZodDto } from "nestjs-zod/dto";
import { z } from "nestjs-zod/z";
// type Mood = "casual" | "professional" | "confident" | "friendly";
// 创建 Zod 枚举模式
const MoodEnum = z.enum(["casual", "professional", "confident", "friendly"]);
// 定义 openaiSchema
export const openaiSchema = z.object({
  text: z.string(),
  mood: MoodEnum, // 使用 Zod 枚举模式
});

export class OpenaiDto extends createZodDto(openaiSchema) {}
