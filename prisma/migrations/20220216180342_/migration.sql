/*
  Warnings:

  - A unique constraint covering the columns `[uuid]` on the table `buy_nft_poll` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uuid]` on the table `floor_sweeper_poll` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "buy_nft_poll.uuid_unique" ON "buy_nft_poll"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "floor_sweeper_poll.uuid_unique" ON "floor_sweeper_poll"("uuid");
