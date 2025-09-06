import { Logger, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  loggingMiddleware,
  PrismaModule,
  PrismaService,
  providePrismaClientExceptionFilter,
} from "nestjs-prisma";

import { Config } from "@/server/config/schema";

@Module({
  imports: [
    PrismaModule.forRootAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Config>) => ({
        prismaOptions: {
          datasourceUrl: configService.get("DATABASE_URL"),
          // 连接池配置
          log: ["error", "warn"],
          // 增加连接池超时时间
          __internal: {
            engine: {
              connectionLimit: 10,
              pool: {
                min: 2,
                max: 10,
                acquireTimeoutMillis: 30_000, // 30秒
                createTimeoutMillis: 30_000,
                destroyTimeoutMillis: 5000,
                idleTimeoutMillis: 30_000,
                reapIntervalMillis: 1000,
                createRetryIntervalMillis: 200,
              },
            },
          },
        },
        middlewares: [
          loggingMiddleware({
            logLevel: "debug", // only in development
            logger: new Logger(PrismaService.name),
            logMessage: (query) =>
              `[Query] ${query.model}.${query.action} - ${query.executionTime}ms`,
          }),
        ],
      }),
    }),
  ],
  providers: [providePrismaClientExceptionFilter()],
})
export class DatabaseModule {}
