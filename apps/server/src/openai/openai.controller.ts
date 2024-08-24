import { Body, Controller, Logger, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { OpenaiDto } from "@reactive-resume/dto";

import { TwoFactorGuard } from "../auth/guards/two-factor.guard";
import { OpenaiService } from "./openai.service";
@ApiTags("Openai")
@Controller("openai")
export class OpenaiController {
  constructor(private readonly openaiService: OpenaiService) {}

  @UseGuards(TwoFactorGuard)
  @Post("/fixgrammer")
  async fixtgrammer(@Body() data: { text: string }) {
    Logger.log(data.text);
    try {
      return await this.openaiService.fixgrammer(data.text);
    } catch (error) {
      Logger.error(error);
      return data.text;
    }
  }

  @UseGuards(TwoFactorGuard)
  @Post("/changtone")
  async changtone(@Body() openaiDto: OpenaiDto) {
    Logger.log(openaiDto.text);
    try {
      return await this.openaiService.changetone(openaiDto.text, openaiDto.mood);
    } catch (error) {
      Logger.error(error);
      return openaiDto.text;
    }
  }

  @UseGuards(TwoFactorGuard)
  @Post("/improvewriting")
  async improvewriting(@Body() data: { text: string }) {
    Logger.log(data.text);
    try {
      return await this.openaiService.immprovewriting(data.text);
    } catch (error) {
      Logger.error(error);
      return data.text;
    }
  }
}
