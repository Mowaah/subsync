import AsyncStorage from '@react-native-async-storage/async-storage';
import {Subscription} from '../types';

/**
 * Ensures that all subscription data has the necessary fields
 * for compatibility with the latest app version
 */
export const migrateData = async (): Promise<void> => {
  try {
    // Migrate subscriptions
    const subscriptionsJson = await AsyncStorage.getItem('subscriptions');
    if (subscriptionsJson) {
      const subscriptions: Subscription[] = JSON.parse(subscriptionsJson);

      // Check if any subscriptions need migration (missing originalCurrency)
      const needsMigration = subscriptions.some(sub => !sub.originalCurrency);

      if (needsMigration) {
        // Add originalCurrency field to subscriptions that don't have it
        const migratedSubscriptions = subscriptions.map(sub => {
          if (!sub.originalCurrency) {
            return {
              ...sub,
              originalCurrency: 'USD', // Default to USD for existing data
            };
          }
          return sub;
        });

        // Save the migrated data
        await AsyncStorage.setItem(
          'subscriptions',
          JSON.stringify(migratedSubscriptions),
        );

        console.log('Subscription data migration completed');
      }
    }
  } catch (error) {
    console.error('Error migrating data:', error);
  }
};
