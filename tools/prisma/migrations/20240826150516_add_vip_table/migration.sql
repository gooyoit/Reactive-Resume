-- CreateEnum
CREATE TYPE "VipCategories" AS ENUM ('day', 'month', 'renewal_month', 'year', 'renewal_year', 'forever');

-- CreateTable
CREATE TABLE "VipCategory" (
    "id" TEXT NOT NULL,
    "category" "VipCategories" NOT NULL,
    "name" TEXT NOT NULL,
    "tag" TEXT,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "realPrice" DOUBLE PRECISION,
    "countUnit" TEXT NOT NULL DEFAULT 'd',
    "descs" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VipCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VipMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" "VipCategories" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discounted" BOOLEAN NOT NULL DEFAULT false,
    "beginAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endAt" TIMESTAMP(3) NOT NULL,
    "descs" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VipMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VipBenefits" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "category" "VipCategories" NOT NULL,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "resumeId" TEXT NOT NULL,
    "descs" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VipBenefits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VipMember_userId_id_key" ON "VipMember"("userId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "VipBenefits_resumeId_key" ON "VipBenefits"("resumeId");

-- CreateIndex
CREATE UNIQUE INDEX "VipBenefits_resumeId_memberId_key" ON "VipBenefits"("resumeId", "memberId");

-- AddForeignKey
ALTER TABLE "VipMember" ADD CONSTRAINT "VipMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VipBenefits" ADD CONSTRAINT "VipBenefits_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "VipMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VipBenefits" ADD CONSTRAINT "VipBenefits_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
