/**
 * Receives a function which returns an `import(...)`
 * and returns a function which returns the `default`
 * export as the passed type.
 *
 * @param dynamicImport `() => Promise<any>`
 * @returns `() => Promise<T>`
 */
export function getLazyDefaultImport<T>(
  dynamicImport: () => Promise<any>
): () => Promise<T> {
  return async () => {
    const {default: importResult} = await dynamicImport();

    return importResult;
  };
}
