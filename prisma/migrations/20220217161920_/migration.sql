/*
  Warnings:

  - Made the column `uuid` on table `buy_nft_poll` required. This step will fail if there are existing NULL values in that column.
  - Made the column `uuid` on table `floor_sweeper_poll` required. This step will fail if there are existing NULL values in that column.

*/
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- AlterTable
ALTER TABLE "buy_nft_poll" ALTER COLUMN "uuid" SET NOT NULL,
ALTER COLUMN "uuid" SET DEFAULT uuid_generate_v4();

-- AlterTable
ALTER TABLE "floor_sweeper_poll" ALTER COLUMN "uuid" SET NOT NULL,
ALTER COLUMN "uuid" SET DEFAULT uuid_generate_v4();
