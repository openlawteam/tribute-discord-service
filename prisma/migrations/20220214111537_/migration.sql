-- CreateTable
CREATE TABLE "buy_nft_poll" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" VARCHAR(255) NOT NULL,
    "contractAddress" VARCHAR(255) NOT NULL,
    "tokenID" VARCHAR(255) NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "voteThreshold" INTEGER NOT NULL DEFAULT 0,
    "upvoteCount" INTEGER NOT NULL DEFAULT 0,
    "guildID" VARCHAR(255) NOT NULL,
    "channelID" VARCHAR(255) NOT NULL,
    "messageID" VARCHAR(255) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "buy_nft_poll.messageID_unique" ON "buy_nft_poll"("messageID");
