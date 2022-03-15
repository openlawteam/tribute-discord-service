/*
  Warnings:

  - You are about to drop the column `txHash` on the `buy_nft_poll` table. All the data in the column will be lost.
  - You are about to drop the column `txStatus` on the `buy_nft_poll` table. All the data in the column will be lost.
  - You are about to drop the column `txHash` on the `floor_sweeper_poll` table. All the data in the column will be lost.
  - You are about to drop the column `txStatus` on the `floor_sweeper_poll` table. All the data in the column will be lost.
  - You are about to drop the column `txHash` on the `fund_address_poll` table. All the data in the column will be lost.
  - You are about to drop the column `txStatus` on the `fund_address_poll` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "buy_nft_poll" DROP COLUMN "txHash",
DROP COLUMN "txStatus";

-- AlterTable
ALTER TABLE "floor_sweeper_poll" DROP COLUMN "txHash",
DROP COLUMN "txStatus";

-- AlterTable
ALTER TABLE "fund_address_poll" DROP COLUMN "txHash",
DROP COLUMN "txStatus";
