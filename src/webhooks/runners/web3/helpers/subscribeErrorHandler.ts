export function subscribeErrorHandler(
  subscriptionName: string
): (e: Error) => void {
  return (error: Error) => {
    console.log(`
    Error from Web3 subscription for ${subscriptionName}.
    Error: ${error.message}
    `);
  };
}
