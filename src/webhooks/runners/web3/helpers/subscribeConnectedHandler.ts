export function subscribeConnectedHandler(
  subscriptionName: string
): (sid: string) => void {
  return (subscriptionId: string) => {
    console.log(
      `Connected to Web3 subscriptions for ${subscriptionName}. Subscription ID: ${subscriptionId}.`
    );
  };
}
