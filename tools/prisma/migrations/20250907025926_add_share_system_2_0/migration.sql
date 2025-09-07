-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('owner', 'share');

-- CreateEnum
CREATE TYPE "DownloadType" AS ENUM ('owner', 'share_paid_by_owner', 'share_paid_by_viewer');

-- AlterTable
ALTER TABLE "Download" ADD COLUMN     "shareId" TEXT,
ADD COLUMN     "type" "DownloadType" NOT NULL DEFAULT 'owner',
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shareId" TEXT,
ADD COLUMN     "type" "OrderType" NOT NULL DEFAULT 'owner',
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Share" (
    "id" TEXT NOT NULL,
    "shareToken" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Share_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Share_shareToken_key" ON "Share"("shareToken");

-- CreateIndex
CREATE INDEX "Share_shareToken_idx" ON "Share"("shareToken");

-- CreateIndex
CREATE INDEX "Share_resumeId_idx" ON "Share"("resumeId");

-- CreateIndex
CREATE INDEX "Share_ownerId_idx" ON "Share"("ownerId");

-- CreateIndex
CREATE INDEX "Download_shareId_idx" ON "Download"("shareId");

-- CreateIndex
CREATE INDEX "Order_shareId_idx" ON "Order"("shareId");

-- AddForeignKey
ALTER TABLE "Share" ADD CONSTRAINT "Share_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_shareId_fkey" FOREIGN KEY ("shareId") REFERENCES "Share"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Download" ADD CONSTRAINT "Download_shareId_fkey" FOREIGN KEY ("shareId") REFERENCES "Share"("id") ON DELETE SET NULL ON UPDATE CASCADE;
