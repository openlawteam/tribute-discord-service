import fetch from 'node-fetch';

/**
 * Wraps `node-fetch` `GET` and returns JSON, or `undefined` if status code is 404.
 * Accepts a type for casting the type of the return value.
 *
 * @param url `string` i.e. `https://snapshot-hub-erc712.thelao.io/api/museo/proposals`
 * @returns `T`
 */
export async function fetchGetJSON<T = any>(
  url: string
): Promise<T | undefined> {
  let repsonseJSON: T | undefined;

  const response = await fetch(url);

  // Handle a 404 error code
  if (response.status === 404) {
    return undefined;
  }

  // Attempt to get any JSON response
  try {
    repsonseJSON = await response.json();
  } catch (error) {
    repsonseJSON = undefined;
  }

  // Handle other error responses
  if (!response.ok) {
    throw new Error(
      `Something went wrong while getting JSON from ${url}. Error: ${
        JSON.stringify(repsonseJSON, null, 2) || response.statusText
      }`
    );
  }

  return repsonseJSON;
}
