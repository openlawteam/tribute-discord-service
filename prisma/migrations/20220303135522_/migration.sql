/*
  Warnings:

  - A unique constraint covering the columns `[actionMessageID]` on the table `buy_nft_poll` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[actionMessageID]` on the table `floor_sweeper_poll` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[actionMessageID]` on the table `fund_address_poll` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "buy_nft_poll" ADD COLUMN     "actionMessageID" VARCHAR(255);

-- AlterTable
ALTER TABLE "floor_sweeper_poll" ADD COLUMN     "actionMessageID" VARCHAR(255);

-- AlterTable
ALTER TABLE "fund_address_poll" ADD COLUMN     "actionMessageID" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "buy_nft_poll_actionMessageID_key" ON "buy_nft_poll"("actionMessageID");

-- CreateIndex
CREATE UNIQUE INDEX "floor_sweeper_poll_actionMessageID_key" ON "floor_sweeper_poll"("actionMessageID");

-- CreateIndex
CREATE UNIQUE INDEX "fund_address_poll_actionMessageID_key" ON "fund_address_poll"("actionMessageID");
