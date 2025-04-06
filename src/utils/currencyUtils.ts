// Static exchange rates (as of April 2023)
// In a production app, we would use a currency conversion API
export const exchangeRates: Record<string, number> = {
  USD: 1.0, // Base currency
  EUR: 0.92, // 1 USD = 0.92 EUR
  GBP: 0.79, // 1 USD = 0.79 GBP
  JPY: 149.91, // 1 USD = 149.91 JPY
  CAD: 1.36, // 1 USD = 1.36 CAD
  AUD: 1.52, // 1 USD = 1.52 AUD
  INR: 83.49, // 1 USD = 83.49 INR
  CNY: 7.23, // 1 USD = 7.23 CNY
};

/**
 * Convert an amount from one currency to another
 * @param amount Amount to convert
 * @param fromCurrency Source currency code (e.g., 'USD')
 * @param toCurrency Target currency code (e.g., 'EUR')
 * @returns Converted amount
 */
export const convertCurrency = (
  amount: number,
  fromCurrency: string = 'USD',
  toCurrency: string = 'USD',
): number => {
  // If the currencies are the same, no conversion needed
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // Check if both currencies are supported
  if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) {
    console.warn(`Unsupported currency: ${fromCurrency} or ${toCurrency}`);
    return amount;
  }

  // Convert to USD first (as it's our base)
  const amountInUSD = amount / exchangeRates[fromCurrency];

  // Then convert from USD to target currency
  return amountInUSD * exchangeRates[toCurrency];
};

/**
 * Format a currency amount with the appropriate symbol and decimal places
 */
export const formatCurrencyWithSymbol = (
  amount: number,
  currencyCode: string = 'USD',
): string => {
  const symbolMap: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
    INR: '₹',
    CNY: '¥',
  };

  const symbol = symbolMap[currencyCode] || '$';

  // Special case for JPY and similar currencies that don't typically use decimal places
  const decimals = ['JPY', 'INR'].includes(currencyCode) ? 0 : 2;

  return `${symbol}${amount.toFixed(decimals)}`;
};
