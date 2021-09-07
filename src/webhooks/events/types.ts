export interface EventBase {
  /**
   * Readable name; good for logging.
   */
  name: string;
  /**
   * Registry type enum.
   */
  type: RegistryTypes;
}

/**
 * Any types of events to be watched
 */
export enum RegistryTypes {
  /**
   * For WebSocket messages via `web3.eth.subscribe('logs')`
   */
  WEB3_LOGS = 'WEB3_LOGS',
}
