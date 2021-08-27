**Register any events for `web3.eth.subscribe('logs')`.**

```ts
// Example

export const SPONSORED_PROPOSAL_WEB3_LOGS: EventWeb3Logs = {
  name: "Sponsored Proposal",
  type: RegistryTypes.WEB3_LOGS,
  address: ["0x..., 0x..., 0x..."],
  lazyABI: getLazyABI(
    "../../../abis/tribute/DaoRegistrySponsoredProposalEvent.json"
  ),
  topics: [SPONSORED_PROPOSAL_EVENT_SIGNATURE_HASH],
};
```
