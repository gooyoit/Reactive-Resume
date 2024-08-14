import { t } from "@lingui/macro";
import { Injectable, Logger } from "@nestjs/common";

import { openai } from "./utils/client";

type Mood = "casual" | "professional" | "confident" | "friendly";

@Injectable()
export class OpenaiService {
  private readonly logger = new Logger(OpenaiService.name);

  private readonly FIX_PROMPT: string;
  private readonly IMMROVING_PROMPT: string;
  private readonly CHANGE_TONE_PROMPT: string;
  constructor() {
    this.FIX_PROMPT = `You are an AI writing assistant specialized in writing copy for resumes.
    Do not return anything else except the text you improved. It should not begin with a newline. It should not have any prefix or suffix text.
    Just fix the spelling and grammar of the following paragraph, do not change the meaning and returns in the language of the text:

    Text: """{input}"""

    Revised Text: """`;

    this.IMMROVING_PROMPT = `You are an AI writing assistant specialized in writing copy for resumes.
      Do not return anything else except the text you improved. It should not begin with a newline. It should not have any prefix or suffix text.
      Improve the writing of the following paragraph and returns in the language of the text:

      Text: """{input}"""

      Revised Text: """`;

    this.CHANGE_TONE_PROMPT = `You are an AI writing assistant specialized in writing copy for resumes.
      Do not return anything else except the text you improved. It should not begin with a newline. It should not have any prefix or suffix text.
      Change the tone of the following paragraph to be {mood} and returns in the language of the text:

      Text: """{input}"""

      Revised Text: """`;
  }

  async fixgrammer(text: string) {
    try {
      // const PROMPT = `You are an AI writing assistant specialized in writing copy for resumes.
      // Do not return anything else except the text you improved. It should not begin with a newline. It should not have any prefix or suffix text.
      // Just fix the spelling and grammar of the following paragraph, do not change the meaning and returns in the language of the text:

      // Text: """{input}"""

      // Revised Text: """`;
      Logger.log("text:" + text);
      const prompt = this.FIX_PROMPT.replace("{input}", text);

      const result = await openai().chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        // model: "gpt-3.5-turbo",
        model: "qwen-long",
        max_tokens: 1024,
        temperature: 0,
        stop: ['"""'],
        n: 1,
      });

      if (result.choices.length === 0) {
        throw new Error(t`OpenAI did not return any choices for your text.`);
      }

      return result.choices[0].message.content ?? text;
    } catch {
      return text;
    }
  }

  async immprovewriting(text: string) {
    try {
      // const PROMPT = `You are an AI writing assistant specialized in writing copy for resumes.
      // Do not return anything else except the text you improved. It should not begin with a newline. It should not have any prefix or suffix text.
      // Improve the writing of the following paragraph and returns in the language of the text:

      // Text: """{input}"""

      // Revised Text: """`;

      const prompt = this.IMMROVING_PROMPT.replace("{input}", text);

      const result = await openai().chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        // model: "gpt-3.5-turbo",
        model: "qwen-long",
        max_tokens: 1024,
        temperature: 0,
        stop: ['"""'],
        n: 1,
      });
      Logger.log(result);
      if (result.choices.length === 0) {
        throw new Error(t`OpenAI did not return any choices for your text.`);
      }

      return result.choices[0].message.content ?? text;
    } catch {
      return text;
    }
  }

  async changetone(text: string, mood: Mood) {
    try {
      // const PROMPT = `You are an AI writing assistant specialized in writing copy for resumes.
      // Do not return anything else except the text you improved. It should not begin with a newline. It should not have any prefix or suffix text.
      // Change the tone of the following paragraph to be {mood} and returns in the language of the text:

      // Text: """{input}"""

      // Revised Text: """`;

      const prompt = this.CHANGE_TONE_PROMPT.replace("{mood}", mood).replace("{input}", text);

      const result = await openai().chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        // model: "gpt-3.5-turbo",
        model: "qwen-long",
        max_tokens: 1024,
        temperature: 0.5,
        stop: ['"""'],
        n: 1,
      });

      if (result.choices.length === 0) {
        throw new Error(t`OpenAI did not return any choices for your text.`);
      }

      return result.choices[0].message.content ?? text;
    } catch {
      return text;
    }
  }
}
