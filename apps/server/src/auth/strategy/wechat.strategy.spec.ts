import { ConfigService } from "@nestjs/config";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { UserService } from "../../user/user.service";
import { WechatStrategy } from "./wechat.strategy";

describe("WechatStrategy", () => {
  let strategy: WechatStrategy;
  let userService: UserService;
  let configService: ConfigService;

  const mockUserService = {
    findOneByIdentifier: jest.fn(),
    create: jest.fn(),
    updateByEmail: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WechatStrategy,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<WechatStrategy>(WechatStrategy);
    userService = module.get<UserService>(UserService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(strategy).toBeDefined();
  });

  it("should have correct strategy name", () => {
    expect(strategy.name).toBe("wechat");
  });

  it("should have correct appId", () => {
    expect(strategy.appId).toBe("test_app_id");
  });

  it("should have correct appSecret", () => {
    expect(strategy.appSecret).toBe("test_app_secret");
  });

  it("should have correct callbackURL", () => {
    expect(strategy.callbackURL).toBe("http://localhost:3000/auth/wechat/callback");
  });

  describe("validate", () => {
    const mockProfile = {
      openid: "test_openid",
      nickname: "测试用户",
      headimgurl: "https://example.com/avatar.jpg",
      unionid: "test_unionid",
    };

    const mockDone = jest.fn();

    beforeEach(() => {
      // 设置策略参数
      (strategy as any).appId = "test_app_id";
      (strategy as any).appSecret = "test_app_secret";
      (strategy as any).callbackURL = "http://localhost:3000/auth/wechat/callback";
    });

    it("should create new user when user does not exist", async () => {
      mockUserService.findOneByIdentifier.mockResolvedValue(null);
      mockUserService.create.mockResolvedValue({
        id: "user_id",
        email: "test_openid@wechat.com",
        name: "测试用户",
        provider: "wechat",
      });

      await strategy.validate("access_token", "refresh_token", mockProfile, mockDone);

      expect(mockUserService.findOneByIdentifier).toHaveBeenCalledWith("test_openid");
      expect(mockUserService.create).toHaveBeenCalledWith({
        email: "test_openid@wechat.com",
        picture: "https://example.com/avatar.jpg",
        locale: "zh-CN",
        provider: "wechat",
        name: "测试用户",
        emailVerified: true,
        username: expect.any(String),
        secrets: { create: {} },
      });
      expect(mockDone).toHaveBeenCalledWith(null, expect.any(Object));
    });

    it("should return existing user when found by openid", async () => {
      const existingUser = {
        id: "existing_user_id",
        email: "existing@wechat.com",
        name: "Existing User",
        provider: "wechat",
      };

      mockUserService.findOneByIdentifier.mockResolvedValue(existingUser);
      mockUserService.updateByEmail.mockResolvedValue();

      await strategy.validate("access_token", "refresh_token", mockProfile, mockDone);

      expect(mockUserService.findOneByIdentifier).toHaveBeenCalledWith("test_openid");
      expect(mockUserService.updateByEmail).toHaveBeenCalledWith("existing@wechat.com", {
        updatedAt: expect.any(Date),
      });
      expect(mockDone).toHaveBeenCalledWith(null, existingUser);
    });

    it("should return existing user when found by unionid", async () => {
      const existingUser = {
        id: "existing_user_id",
        email: "existing@wechat.com",
        name: "Existing User",
        provider: "wechat",
      };

      mockUserService.findOneByIdentifier
        .mockResolvedValueOnce(null) // openid not found
        .mockResolvedValueOnce(existingUser); // unionid found

      mockUserService.updateByEmail.mockResolvedValue();

      await strategy.validate("access_token", "refresh_token", mockProfile, mockDone);

      expect(mockUserService.findOneByIdentifier).toHaveBeenCalledWith("test_openid");
      expect(mockUserService.findOneByIdentifier).toHaveBeenCalledWith("test_unionid");
      expect(mockDone).toHaveBeenCalledWith(null, existingUser);
    });

    it("should handle user creation error", async () => {
      mockUserService.findOneByIdentifier.mockResolvedValue(null);
      mockUserService.create.mockRejectedValue(new Error("User creation failed"));

      await strategy.validate("access_token", "refresh_token", mockProfile, mockDone);

      expect(mockDone).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
