-- CreateTable
CREATE TABLE "daos" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" VARCHAR(255) NOT NULL,
    "registryAddress" VARCHAR(42) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discord_webhooks" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "webhookID" VARCHAR(255) NOT NULL,
    "webhookToken" VARCHAR(255) NOT NULL,
    "daoId" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daos.name_unique" ON "daos"("name");

-- CreateIndex
CREATE UNIQUE INDEX "daos.registryAddress_unique" ON "daos"("registryAddress");

-- CreateIndex
CREATE UNIQUE INDEX "discord_webhooks.webhookID_unique" ON "discord_webhooks"("webhookID");

-- AddForeignKey
ALTER TABLE "discord_webhooks" ADD FOREIGN KEY ("daoId") REFERENCES "daos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
