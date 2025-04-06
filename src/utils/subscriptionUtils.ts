import {Subscription} from '../types';
import {convertCurrency, formatCurrencyWithSymbol} from './currencyUtils';

/**
 * Calculates the next billing date based on the subscription details
 */
export const calculateNextBillingDate = (
  startDate: string,
  billingCycle: Subscription['billingCycle'],
  customBillingDays?: number,
): string => {
  const date = new Date(startDate);
  const today = new Date();

  // Make sure we're starting from a date not earlier than today
  if (date < today) {
    date.setTime(today.getTime());
  }

  switch (billingCycle) {
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
    case 'custom':
      if (customBillingDays) {
        date.setDate(date.getDate() + customBillingDays);
      }
      break;
  }

  return date.toISOString();
};

/**
 * Calculates the annual cost of a subscription
 */
export const calculateAnnualCost = (
  cost: number,
  billingCycle: Subscription['billingCycle'],
  customBillingDays?: number,
  originalCurrency?: string,
  targetCurrency?: string,
): number => {
  // If currency conversion is needed
  if (
    originalCurrency &&
    targetCurrency &&
    originalCurrency !== targetCurrency
  ) {
    cost = convertCurrency(cost, originalCurrency, targetCurrency);
  }

  switch (billingCycle) {
    case 'monthly':
      return cost * 12;
    case 'quarterly':
      return cost * 4;
    case 'yearly':
      return cost;
    case 'custom':
      if (customBillingDays) {
        return cost * (365 / customBillingDays);
      }
      return cost;
    default:
      return cost;
  }
};

/**
 * Formats a date in a user-friendly format
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Formats a currency amount
 */
export const formatCurrency = (
  amount: number,
  displayCurrency: string = 'USD',
  originalCurrency?: string,
): string => {
  // If both currencies are provided, convert the amount
  if (originalCurrency && originalCurrency !== displayCurrency) {
    amount = convertCurrency(amount, originalCurrency, displayCurrency);
  }

  // Use the new formatCurrencyWithSymbol function for consistent display
  return formatCurrencyWithSymbol(amount, displayCurrency);
};

/**
 * Returns subscriptions that need renewal in the specified number of days
 */
export const getUpcomingRenewals = (
  subscriptions: Subscription[],
  days: number = 7,
): Subscription[] => {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days);

  return subscriptions.filter(sub => {
    if (!sub.active) return false;

    const nextBillingDate = new Date(sub.nextBillingDate);
    return nextBillingDate >= today && nextBillingDate <= futureDate;
  });
};

/**
 * Groups subscriptions by category
 */
export const groupByCategory = (
  subscriptions: Subscription[],
): Record<string, Subscription[]> => {
  return subscriptions.reduce((groups, subscription) => {
    const category = subscription.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(subscription);
    return groups;
  }, {} as Record<string, Subscription[]>);
};

/**
 * Calculates total monthly spending on active subscriptions
 */
export const calculateMonthlySpending = (
  subscriptions: Subscription[],
  targetCurrency: string = 'USD',
): number => {
  return subscriptions
    .filter(sub => sub.active)
    .reduce((total, subscription) => {
      const {cost, billingCycle, customBillingDays, originalCurrency} =
        subscription;

      // Convert cost to target currency if needed
      let convertedCost = cost;
      if (originalCurrency && originalCurrency !== targetCurrency) {
        convertedCost = convertCurrency(cost, originalCurrency, targetCurrency);
      }

      switch (billingCycle) {
        case 'monthly':
          return total + convertedCost;
        case 'quarterly':
          return total + convertedCost / 3;
        case 'yearly':
          return total + convertedCost / 12;
        case 'custom':
          if (customBillingDays) {
            return total + convertedCost / (customBillingDays / 30);
          }
          return total;
        default:
          return total;
      }
    }, 0);
};
