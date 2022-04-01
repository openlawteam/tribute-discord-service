/**
 * Register unique action names
 */
export const ACTIONS = [
  /**
   * Snapshot Hub
   */
  'SNAPSHOT_DRAFT_CREATED_WEBHOOK',
  'SNAPSHOT_PROPOSAL_CREATED_WEBHOOK',
  'SNAPSHOT_PROPOSAL_END_WEBHOOK',
  'SNAPSHOT_PROPOSAL_START_WEBHOOK',
  /**
   * Tribute DAO
   */
  'SPONSORED_PROPOSAL_WEBHOOK',
  /**
   * Tribute Tools
   */
  'TRIBUTE_TOOLS_ADMIN_FEE_WEBHOOK',
] as const;
