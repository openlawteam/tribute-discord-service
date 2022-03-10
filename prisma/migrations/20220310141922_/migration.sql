-- AlterTable
ALTER TABLE "buy_nft_poll" ADD COLUMN     "isCancelled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "floor_sweeper_poll" ADD COLUMN     "isCancelled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "fund_address_poll" ADD COLUMN     "isCancelled" BOOLEAN NOT NULL DEFAULT false;
