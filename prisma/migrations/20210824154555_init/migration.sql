-- CreateTable
CREATE TABLE "orgs" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" VARCHAR(255) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discord_webhooks" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "webhookID" VARCHAR(255) NOT NULL,
    "webhookToken" VARCHAR(255) NOT NULL,
    "orgId" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "orgs.name_unique" ON "orgs"("name");

-- CreateIndex
CREATE UNIQUE INDEX "discord_webhooks.webhookID_unique" ON "discord_webhooks"("webhookID");

-- AddForeignKey
ALTER TABLE "discord_webhooks" ADD FOREIGN KEY ("orgId") REFERENCES "orgs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
