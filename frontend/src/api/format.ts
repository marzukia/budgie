/** Format a dollar amount with proper decimal places and currency symbol.
 *
 * Uses 2 decimals by default (AUD, USD, EUR).
 * Pass decimals=0 for JPY, KRW; decimals=3 for BHD, OMR.
 *
 * @param value - The numeric amount in whole dollars
 * @param currency - ISO currency code (default 'AUD')
 * @param decimals - Decimal places (default 2)
 */
export function formatCurrency(value: number, currency = "AUD", decimals = 2): string {
  const symbol: Record<string, string> = {
    AUD: "A$",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    KRW: "₩",
    BHD: "BD",
    OMR: "OMR",
  };
  const prefix = symbol[currency] ?? currency;
  return `${prefix}${value.toFixed(decimals)}`;
}
