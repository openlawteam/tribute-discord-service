export function subscribeConnectedHandler(
  subscriptionName: string
): () => void {
  return () => {
    console.log(`Connected to Web3 subscriptions for: ${subscriptionName}`);
  };
}
