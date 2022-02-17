-- AlterTable
ALTER TABLE "buy_nft_poll" ADD COLUMN     "uuid" UUID NOT NULL DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "floor_sweeper_poll" ADD COLUMN     "uuid" UUID NOT NULL DEFAULT gen_random_uuid();
