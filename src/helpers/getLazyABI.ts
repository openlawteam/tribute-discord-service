import {AbiItem} from 'web3-utils/types';

export function getLazyABI(importPath: string): () => Promise<AbiItem> {
  return async () => {
    const {default: ABI} = await import(importPath);

    return ABI;
  };
}
