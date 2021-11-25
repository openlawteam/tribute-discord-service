import {AbiItem} from 'web3-utils/types';

import {DaoRegistry} from '../../../abi-types/DaoRegistry';
import {BURN_ADDRESS, getLazyDefaultImport} from '../../helpers';
import {web3} from '../../singletons';

export async function getProposalAdapterID({
  adapterAddress,
  daoAddress,
  proposalID,
}: {
  adapterAddress?: string;
  daoAddress: string;
  proposalID?: string;
}): Promise<string | undefined> {
  const daoRegistryProposalsABI = await getLazyDefaultImport<AbiItem>(
    () => import('../../abis/tribute/DaoRegistry.json')
  )();

  const contract = new web3.eth.Contract(
    daoRegistryProposalsABI,
    daoAddress
  ) as any as DaoRegistry;

  let adapterAddressToUse: string = '';

  if (adapterAddress) {
    adapterAddressToUse = adapterAddress;
  }

  if (!adapterAddress && proposalID) {
    const {adapterAddress: a} = await contract.methods
      .proposals(proposalID)
      .call();

    if (a === BURN_ADDRESS) return undefined;

    adapterAddressToUse = a;
  }

  if (!adapterAddressToUse) return undefined;

  const {id} = await contract.methods
    .inverseAdapters(adapterAddressToUse)
    .call();

  return id;
}
