/** Format a dollar amount with proper decimal places.
 *
 * Uses 2 decimals by default (AUD, USD, EUR).
 * Pass decimals=0 for JPY, KRW; decimals=3 for BHD, OMR.
 */
export function formatCurrency(value: number, decimals = 2): string {
  return `$${value.toFixed(decimals)}`;
}
