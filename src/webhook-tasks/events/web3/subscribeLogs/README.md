**Register any events for `web3.eth.subscribe('logs')`.**

```ts
// Example

const lazyABIImport = () => import("../../../../abis/tribute/DaoRegistry.json");

export const SPONSORED_PROPOSAL_WEB3_LOGS: EventWeb3Logs = {
  lazyABI: getLazyDefaultImport<AbiItem[]>(lazyABIImport),
  name: "SPONSORED_PROPOSAL",
  topics: [SPONSORED_PROPOSAL_EVENT_SIGNATURE_HASH],
};
```
