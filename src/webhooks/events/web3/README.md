**Add a directory and configuration for any Web3 events.**

e.g. `subscribeLogs/` for `web3.eth.subscribe('logs')`

For each event which should be subscribed to, export a `const` of type `EventWeb3Logs`.

Example directory shape:

```
subscribeLogs/
  // Be sure to update the index.ts for easier exports.
  index.ts
  README.md

  // Exports a number of `const` with type `EventWeb3Logs`
  processedProposal.ts
  sponsoredProposal.ts
  submittedProposal.ts
```

To keep to a minimum the number of listeners, be sure to re-use a configuration possible. For instance, in the case of `web3.eth.subscribe('logs')` you can can listen to multiple contract addresses for the same event (e.g. multiple DAO registry addresses can be watched for a single `SponsoredProposal` event).
