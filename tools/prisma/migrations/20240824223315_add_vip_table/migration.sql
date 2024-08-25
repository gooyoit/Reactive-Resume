-- CreateTable
CREATE TABLE "Vip" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL DEFAULT 0,
    "category" TEXT NOT NULL DEFAULT 0,
    "tag" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "discountedPrice" INTEGER NOT NULL,
    "durationUnit" TEXT NOT NULL DEFAULT 'd', -- d 天，m 月，y 年
    "description" INTEGER NOT NULL DEFAULT 0,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vip_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Benefits" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 0,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "tag" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "discountedPrice" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Benefits_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Members" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL DEFAULT 0,
    "category" TEXT NOT NULL DEFAULT 0,
    "downloadCount" INTEGER NOT NULL DEFAULT 0, -- 已下载次数
    "price" INTEGER NOT NULL, -- 价格
    "discounted" BOOLEAN NOT NULL DEFAULT false, -- 是否打折购买
    "begin" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vip_pkey" PRIMARY KEY ("id")
);
