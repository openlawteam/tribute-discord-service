export type DaoData = {
  /**
   * A friendly name for the DAO.
   *
   * E.g. `Tribute DAO`
   */
  friendlyName: string;
  /**
   * A public, full URL for the DAO.
   */
  fullURL: string;
  /**
   * DAO's deployed `DaoRegistry.sol` contract address.
   */
  registryContractAddress: string;
};
