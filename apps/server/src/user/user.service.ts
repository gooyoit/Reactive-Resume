import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { Prisma, User } from "@prisma/client";
import { UserWithSecrets } from "@reactive-resume/dto";
import { ErrorMessage } from "@reactive-resume/utils";
import retry from "async-retry";
import { PrismaService } from "nestjs-prisma";

import { StorageService } from "../storage/storage.service";

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  findOneById(id: string): Promise<UserWithSecrets> {
    return retry(
      async () => {
        const user = await this.prisma.user.findUniqueOrThrow({
          where: { id },
          include: { secrets: true },
        });

        if (!user.secrets) {
          throw new InternalServerErrorException(ErrorMessage.SecretsNotFound);
        }

        return user;
      },
      {
        retries: 3,
        factor: 2,
        minTimeout: 1000,
        maxTimeout: 5000,
        onRetry: (error, attempt) => {
          this.logger.warn(
            `Database connection retry attempt ${attempt}: ${(error as Error).message}`,
          );
        },
      },
    );
  }

  async findOneByIdentifier(identifier: string): Promise<UserWithSecrets | null> {
    const user = await (async (identifier: string) => {
      // First, find the user by email
      const user = await this.prisma.user.findUnique({
        where: { email: identifier },
        include: { secrets: true },
      });

      // If the user exists, return it
      if (user) return user;

      // Otherwise, find the user by username
      // If the user doesn't exist, throw an error
      return this.prisma.user.findUnique({
        where: { username: identifier },
        include: { secrets: true },
      });
    })(identifier);

    return user;
  }

  async findOneByIdentifierOrThrow(identifier: string): Promise<UserWithSecrets> {
    const user = await (async (identifier: string) => {
      // First, find the user by email
      const user = await this.prisma.user.findUnique({
        where: { email: identifier },
        include: { secrets: true },
      });

      // If the user exists, return it
      if (user) return user;

      // Otherwise, find the user by username
      // If the user doesn't exist, throw an error
      return this.prisma.user.findUniqueOrThrow({
        where: { username: identifier },
        include: { secrets: true },
      });
    })(identifier);

    return user;
  }

  create(data: Prisma.UserCreateInput): Promise<UserWithSecrets> {
    return this.prisma.user.create({ data, include: { secrets: true } });
  }

  updateByEmail(email: string, data: Prisma.UserUpdateArgs["data"]): Promise<User> {
    return this.prisma.user.update({ where: { email }, data });
  }

  async updateByResetToken(
    resetToken: string,
    data: Prisma.SecretsUpdateArgs["data"],
  ): Promise<void> {
    await this.prisma.secrets.update({ where: { resetToken }, data });
  }

  async deleteOneById(id: string): Promise<void> {
    await Promise.all([
      this.storageService.deleteFolder(id),
      this.prisma.user.delete({ where: { id } }),
    ]);
  }
}
