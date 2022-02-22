-- CreateTable
CREATE TABLE "fund_address_poll" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "purpose" VARCHAR(255) NOT NULL,
    "addressToFund" VARCHAR(255) NOT NULL,
    "amountUSDC" INTEGER NOT NULL DEFAULT 0,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "voteThreshold" INTEGER NOT NULL DEFAULT 0,
    "upvoteCount" INTEGER NOT NULL DEFAULT 0,
    "guildID" VARCHAR(255) NOT NULL,
    "channelID" VARCHAR(255) NOT NULL,
    "messageID" VARCHAR(255) NOT NULL,

    CONSTRAINT "fund_address_poll_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fund_address_poll_uuid_key" ON "fund_address_poll"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "fund_address_poll_messageID_key" ON "fund_address_poll"("messageID");
