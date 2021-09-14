/**
 * Converts a HEX string (e.g. `'#FFFFFF'`) to a base16 value
 *
 * @param string Hex string
 * @returns `number`
 */
export function hexToBase16(hex: string): number | null {
  // In case of CSS/HTML values
  const result = parseInt(hex.replace('#', ''), 16);

  if (isNaN(result)) return null;

  return result;
}
