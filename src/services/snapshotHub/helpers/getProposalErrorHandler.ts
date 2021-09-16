export function getProposalErrorHandler({
  error,
  proposalID,
}: {
  error: Error;
  proposalID: string;
}): void {
  console.error(
    `Error while getting Snapshot Hub proposal ${proposalID}.\n${error.stack}`
  );
}
