-- RenameIndex
ALTER INDEX "buy_nft_poll.messageID_unique" RENAME TO "buy_nft_poll_messageID_key";

-- RenameIndex
ALTER INDEX "buy_nft_poll.uuid_unique" RENAME TO "buy_nft_poll_uuid_key";

-- RenameIndex
ALTER INDEX "discord_webhooks.webhookID_unique" RENAME TO "discord_webhooks_webhookID_key";

-- RenameIndex
ALTER INDEX "floor_sweeper_poll.messageID_unique" RENAME TO "floor_sweeper_poll_messageID_key";

-- RenameIndex
ALTER INDEX "floor_sweeper_poll.uuid_unique" RENAME TO "floor_sweeper_poll_uuid_key";
