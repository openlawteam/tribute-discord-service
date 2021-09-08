export function getLazyImport<T>(
  dynamicImport: () => Promise<any>
): () => Promise<T> {
  return async () => {
    const {default: importResult} = await dynamicImport();

    return importResult;
  };
}
