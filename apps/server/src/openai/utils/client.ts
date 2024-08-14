import { t } from "@lingui/macro";
import { OpenAI } from "openai";

export const openai = () => {
  const apiKey = process.env.OPENAI_API_KEY ?? "";
  const baseURL =
    process.env.OPENAI_BASE_URL ?? "https://dashscope.aliyuncs.com/compatible-mode/v1";

  if (!apiKey) {
    throw new Error(
      t`Your OpenAI API Key has not been set yet. Please go to your account settings to enable OpenAI Integration.`,
    );
  }

  return new OpenAI({
    apiKey,
    baseURL,
    dangerouslyAllowBrowser: true,
  });
};
