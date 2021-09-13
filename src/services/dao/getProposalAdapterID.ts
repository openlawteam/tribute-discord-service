import {AbiItem} from 'web3-utils/types';

import {DaoRegistry} from '../../../abi-types/DaoRegistry';
import {getLazyDefaultImport} from '../../helpers';
import {web3} from '../../alchemyWeb3Instance';

export async function getProposalAdapterID(
  proposalID: string,
  daoAddress: string
): Promise<string> {
  const daoRegistryProposalsABI = await getLazyDefaultImport<AbiItem>(
    () => import('../../abis/tribute/DaoRegistry.json')
  )();

  const contract = new web3.eth.Contract(
    daoRegistryProposalsABI,
    daoAddress
  ) as any as DaoRegistry;

  const {adapterAddress} = await contract.methods.proposals(proposalID).call();

  const {id} = await contract.methods.inverseAdapters(adapterAddress).call();

  return id;
}
