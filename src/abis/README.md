# ABIs

The ABIs here are meant to be as small as possible. Not all ABI files will be of the entire contract.

**Example:**

```js
// SponsoredProposalEvent.json
[
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "proposalId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "flags",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "votingAdapter",
        type: "address",
      },
    ],
    name: "SponsoredProposal",
    type: "event",
  },
];
```
