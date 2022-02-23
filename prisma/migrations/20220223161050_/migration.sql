-- CreateEnum
CREATE TYPE "TributeToolsTxStatus" AS ENUM ('failed', 'success');

-- AlterTable
ALTER TABLE "buy_nft_poll" ADD COLUMN     "txHash" VARCHAR(255),
ADD COLUMN     "txStatus" "TributeToolsTxStatus";

-- AlterTable
ALTER TABLE "floor_sweeper_poll" ADD COLUMN     "txHash" VARCHAR(255),
ADD COLUMN     "txStatus" "TributeToolsTxStatus";

-- AlterTable
ALTER TABLE "fund_address_poll" ADD COLUMN     "txHash" VARCHAR(255),
ADD COLUMN     "txStatus" "TributeToolsTxStatus";
