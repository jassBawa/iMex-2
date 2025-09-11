/*
  Warnings:

  - You are about to drop the column `assetId` on the `ExistingTrade` table. All the data in the column will be lost.
  - You are about to drop the `Asset` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `asset` to the `ExistingTrade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `balance` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."ExistingTrade" DROP CONSTRAINT "ExistingTrade_assetId_fkey";

-- AlterTable
ALTER TABLE "public"."ExistingTrade" DROP COLUMN "assetId",
ADD COLUMN     "asset" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "balance" INTEGER NOT NULL;

-- DropTable
DROP TABLE "public"."Asset";
