/**
 * Register unique event names
 */
export const EVENTS = [
  /**
   * Snapshot Hub
   */
  'SNAPSHOT_PROPOSAL_CREATED',
  'SNAPSHOT_PROPOSAL_END',
  'SNAPSHOT_PROPOSAL_START',
  /**
   * Tribute DAO
   */
  'SPONSORED_PROPOSAL',
  /**
   * Tribute Tools
   */
  'TRIBUTE_TOOLS_ADMIN_FEE',
] as const;
