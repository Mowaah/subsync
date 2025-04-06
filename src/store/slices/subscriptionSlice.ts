// Import the polyfill for crypto.getRandomValues()
import 'react-native-get-random-values';
import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Subscription, Category} from '../../types';
import {calculateNextBillingDate} from '../../utils/subscriptionUtils';
import {v4 as uuidv4} from 'uuid';

// Initial category data
const defaultCategories: Category[] = [
  {id: '1', name: 'Streaming', color: '#e53935'},
  {id: '2', name: 'Music', color: '#8e24aa'},
  {id: '3', name: 'News', color: '#1e88e5'},
  {id: '4', name: 'Gaming', color: '#43a047'},
  {id: '5', name: 'Software', color: '#fb8c00'},
  {id: '6', name: 'Other', color: '#546e7a'},
];

interface SubscriptionState {
  items: Subscription[];
  categories: Category[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: SubscriptionState = {
  items: [],
  categories: defaultCategories,
  status: 'idle',
  error: null,
};

// Async thunks
export const fetchSubscriptions = createAsyncThunk(
  'subscriptions/fetchSubscriptions',
  async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('subscriptions');
      const subscriptions = jsonValue != null ? JSON.parse(jsonValue) : [];

      // Add originalCurrency field to any existing subscriptions that don't have it
      return subscriptions.map((sub: Subscription) => {
        if (!sub.originalCurrency) {
          return {
            ...sub,
            originalCurrency: 'USD', // Assume USD for existing subscriptions
          };
        }
        return sub;
      });
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }
  },
);

export const fetchCategories = createAsyncThunk(
  'subscriptions/fetchCategories',
  async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('categories');
      return jsonValue != null ? JSON.parse(jsonValue) : defaultCategories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },
);

export const saveSubscriptions = createAsyncThunk(
  'subscriptions/saveSubscriptions',
  async (subscriptions: Subscription[]) => {
    try {
      await AsyncStorage.setItem(
        'subscriptions',
        JSON.stringify(subscriptions),
      );
      return subscriptions;
    } catch (error) {
      console.error('Error saving subscriptions:', error);
      throw error;
    }
  },
);

export const saveCategories = createAsyncThunk(
  'subscriptions/saveCategories',
  async (categories: Category[]) => {
    try {
      await AsyncStorage.setItem('categories', JSON.stringify(categories));
      return categories;
    } catch (error) {
      console.error('Error saving categories:', error);
      throw error;
    }
  },
);

const subscriptionSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {
    addSubscription: (
      state,
      action: PayloadAction<Omit<Subscription, 'id' | 'nextBillingDate'>>,
    ) => {
      const id = uuidv4();
      const nextBillingDate = calculateNextBillingDate(
        action.payload.startDate,
        action.payload.billingCycle,
        action.payload.customBillingDays,
      );

      const newSubscription: Subscription = {
        ...action.payload,
        id,
        nextBillingDate,
      };

      state.items.push(newSubscription);

      // We don't need to await here as this is handled by Redux middleware
      saveSubscriptions(state.items);
    },

    updateSubscription: (state, action: PayloadAction<Subscription>) => {
      const index = state.items.findIndex(sub => sub.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;

        // We don't need to await here as this is handled by Redux middleware
        saveSubscriptions(state.items);
      }
    },

    deleteSubscription: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(sub => sub.id !== action.payload);

      // We don't need to await here as this is handled by Redux middleware
      saveSubscriptions(state.items);
    },

    addCategory: (state, action: PayloadAction<Omit<Category, 'id'>>) => {
      const id = uuidv4();
      const newCategory: Category = {
        ...action.payload,
        id,
      };

      state.categories.push(newCategory);

      // We don't need to await here as this is handled by Redux middleware
      saveCategories(state.categories);
    },

    updateCategory: (state, action: PayloadAction<Category>) => {
      const index = state.categories.findIndex(
        cat => cat.id === action.payload.id,
      );
      if (index !== -1) {
        state.categories[index] = action.payload;

        // We don't need to await here as this is handled by Redux middleware
        saveCategories(state.categories);
      }
    },

    deleteCategory: (state, action: PayloadAction<string>) => {
      state.categories = state.categories.filter(
        cat => cat.id !== action.payload,
      );

      // We don't need to await here as this is handled by Redux middleware
      saveCategories(state.categories);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchSubscriptions.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch subscriptions';
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      });
  },
});

export const {
  addSubscription,
  updateSubscription,
  deleteSubscription,
  addCategory,
  updateCategory,
  deleteCategory,
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer;
