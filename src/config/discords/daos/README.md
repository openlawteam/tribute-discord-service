**Add configuration for a DAO in order to respond to any of its related events**

See `config/types.ts` `DaoDiscordConfig` for documentation about the configuration.

Example:

```ts
museo: {
  actions: [{name: 'SPONSORED_PROPOSAL_WEBHOOK', webhookID: 'abc123'}],
  adapters: {
    [CORE_DAO_ADAPTERS['tribute-nft']]: {
      friendlyName: 'tribute-nft',
      baseURLPath: 'curation',
    },
  },
  baseURL: 'https://demo.tributedao.com',
  events: [{name: 'SPONSORED_PROPOSAL'}],
  friendlyName: 'Muse0',
  registryContractAddress: '0x7c8B281C56f7ef9b8099D3F491AF24DC2C2e3ee0',
  snapshotHub: {
    proposalResolver: async (proposalID, space) =>
      await legacyTributeProposalResolver({
        apiBaseURL: 'http://some-snapshot-hub/api',
        proposalID,
        space,
      }),
    space: 'museo',
  },
}
```
