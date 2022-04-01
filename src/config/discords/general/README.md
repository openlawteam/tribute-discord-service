**Add configuration for a Discord server in order to respond to related events**

See `config/types.ts` `DiscordConfig` for documentation about the configuration.

Example:

```ts
const LOCALHOST_DISCORD_NAMES = ["tributeLabs"] as const;

export const LOCALHOST_DISCORD_CONFIGS: Record<
  typeof LOCALHOST_DISCORD_NAMES[number],
  DiscordConfig
> = {
  tributeLabs: {
    actions: [
      {
        name: "TRIBUTE_TOOLS_ADMIN_FEE_WEBHOOK",
        webhookID: "886976872611729439",
      },
    ],
    baseURL: "https://tributelabs.xyz",
    events: [],
    friendlyName: "Tribute Labs",
    guildID: "722525233755717762",
  },
};
```
