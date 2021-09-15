export function getProposalErrorHandler({
  error,
  proposalID,
}: {
  error: Error;
  proposalID: string;
}): void {
  console.log(
    `Error while getting Snapshot Hub proposal ${proposalID}.\nError: "${error.stack}"`
  );
}
