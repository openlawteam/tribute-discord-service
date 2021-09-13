export type RunnerReturn = {
  /**
   * Friendly name for logging and debugging.
   * Typically, this will be from the event's data.
   */
  eventName: string;
  /**
   * A callback to unsubscribe, stop polling, etc.
   */
  stop?: () => Promise<any>;
};
