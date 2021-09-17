import {sha3} from 'web3-utils';

export const CORE_DAO_ADAPTER_NAMES = [
  'configuration',
  'distribute',
  'erc1155-adpt',
  'financing',
  'guildkick',
  'managing',
  'onboarding',
  'ragequit',
  'tribute-nft',
  'tribute',
] as const;

export const CORE_DAO_ADAPTERS: Record<
  typeof CORE_DAO_ADAPTER_NAMES[number],
  string
> = {
  'erc1155-adpt': getAdapterSha3('erc1155-adpt'),
  'tribute-nft': getAdapterSha3('tribute-nft'),
  configuration: getAdapterSha3('configuration'),
  distribute: getAdapterSha3('distribute'),
  financing: getAdapterSha3('financing'),
  guildkick: getAdapterSha3('guildkick'),
  managing: getAdapterSha3('managing'),
  onboarding: getAdapterSha3('onboarding'),
  ragequit: getAdapterSha3('ragequit'),
  tribute: getAdapterSha3('tribute'),
} as const;

function getAdapterSha3(name: typeof CORE_DAO_ADAPTER_NAMES[number]): string {
  return sha3(name) || '';
}
