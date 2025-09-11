/*
  Warnings:

  - Added the required column `slippage` to the `ExistingTrade` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."ExistingTrade" ADD COLUMN     "slippage" INTEGER NOT NULL;
