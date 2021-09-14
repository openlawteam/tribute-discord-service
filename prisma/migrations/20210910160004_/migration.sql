-- CreateTable
CREATE TABLE "discord_webhooks" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" VARCHAR(255) NOT NULL,
    "webhookID" VARCHAR(255) NOT NULL,
    "webhookToken" VARCHAR(255) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "discord_webhooks.webhookID_unique" ON "discord_webhooks"("webhookID");
