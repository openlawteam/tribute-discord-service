-- CreateTable
CREATE TABLE "floor_sweeper_poll" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "question" VARCHAR(255) NOT NULL,
    "contractAddress" VARCHAR(255) NOT NULL,
    "dateEnd" TIMESTAMP(3) NOT NULL,
    "options" JSONB NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "result" INTEGER NOT NULL DEFAULT 0,
    "guildID" VARCHAR(255) NOT NULL,
    "channelID" VARCHAR(255) NOT NULL,
    "messageID" VARCHAR(255) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "floor_sweeper_poll.messageID_unique" ON "floor_sweeper_poll"("messageID");
