export interface Subscription {
  id: string;
  name: string;
  description?: string;
  cost: number;
  originalCurrency: string;
  billingCycle: 'monthly' | 'quarterly' | 'yearly' | 'custom';
  customBillingDays?: number;
  category: string;
  startDate: string;
  nextBillingDate: string;
  reminderSettings: {
    enabled: boolean;
    daysInAdvance: number;
  };
  url?: string;
  notes?: string;
  logoUrl?: string;
  color?: string;
  active: boolean;
  autoRenew: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface RootState {
  subscriptions: {
    items: Subscription[];
    categories: Category[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
  };
  settings: {
    theme: 'dark' | 'light' | 'system';
    currency: string;
  };
}

export interface SubscriptionFormData {
  name: string;
  description?: string;
  cost: string; // String for easy form handling
  originalCurrency?: string;
  billingCycle: 'monthly' | 'quarterly' | 'yearly' | 'custom';
  customBillingDays?: string; // String for easy form handling
  category: string;
  startDate: string;
  url?: string;
  notes?: string;
  logoUrl?: string;
  color?: string;
  active: boolean;
  autoRenew: boolean;
}

export type ThemeType = 'dark' | 'light' | 'system';
