import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, ScrollView, Pressable, Animated} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList, MainTabParamList} from '../navigation/AppNavigator';
import {useAppDispatch, useAppSelector} from '../hooks/useRedux';
import {fetchSubscriptions} from '../store/slices/subscriptionSlice';
import {fetchSettings} from '../store/slices/settingsSlice';
import {
  getUpcomingRenewals,
  formatDate,
  formatCurrency,
} from '../utils/subscriptionUtils';
import type {CompositeNavigationProp} from '@react-navigation/native';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Define a composite navigation type that can navigate in both stack and tab navigators
type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const HomeScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const dispatch = useAppDispatch();

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const {items: subscriptions, status} = useAppSelector(
    state => state.subscriptions,
  );
  const {currency} = useAppSelector(state => state.settings);

  // Set up header with settings button
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          style={({pressed}) => [
            {
              opacity: pressed ? 0.7 : 1,
              padding: 8,
            },
          ]}
          onPress={() => navigation.navigate('Settings')}>
          <Icon name="cog" size={24} color={theme.colors.primary} />
        </Pressable>
      ),
    });
  }, [navigation, theme]);

  // Fetch subscriptions and settings when component mounts
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchSubscriptions());
      dispatch(fetchSettings());
    }

    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [dispatch, status, fadeAnim, slideAnim]);

  const upcomingRenewals = getUpcomingRenewals(subscriptions, 7);
  const activeSubscriptions = subscriptions.filter(sub => sub.active);

  // Get subscription categories breakdown
  const categoryBreakdown: Record<string, number> = activeSubscriptions.reduce(
    (acc: Record<string, number>, sub) => {
      acc[sub.category] = (acc[sub.category] || 0) + 1;
      return acc;
    },
    {},
  );

  // Get most common category
  const mostCommonCategory =
    Object.keys(categoryBreakdown).length > 0
      ? Object.keys(categoryBreakdown).reduce(
          (a, b) => (categoryBreakdown[a] > categoryBreakdown[b] ? a : b),
          Object.keys(categoryBreakdown)[0],
        )
      : '';

  return (
    <View
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Active Subscriptions Card */}
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              opacity: fadeAnim,
              transform: [{translateY: slideAnim}],
            },
          ]}>
          <View style={styles.cardContent}>
            <View style={styles.cardTitleContainer}>
              <Icon
                name="credit-card-outline"
                size={22}
                color={theme.colors.primary}
                style={styles.cardIcon}
              />
              <Text variant="titleLarge" style={styles.cardTitle}>
                Your Subscriptions
              </Text>
            </View>

            <View style={styles.subscriptionStats}>
              <View style={styles.activeCountContainer}>
                <Text
                  variant="displayMedium"
                  style={{color: theme.colors.primary, fontWeight: 'bold'}}>
                  {activeSubscriptions.length}
                </Text>
                <Text
                  variant="titleMedium"
                  style={{color: theme.colors.onSurfaceVariant}}>
                  Active Subscriptions
                </Text>
              </View>

              {mostCommonCategory && (
                <View style={styles.categoryContainer}>
                  <View style={styles.categoryIconContainer}>
                    <Icon
                      name={getCategoryIcon(mostCommonCategory)}
                      size={28}
                      color={theme.colors.primary}
                    />
                  </View>
                  <View style={styles.categoryTextContainer}>
                    <Text
                      variant="bodyMedium"
                      style={{color: theme.colors.onSurfaceVariant}}>
                      Most Used Category
                    </Text>
                    <Text variant="titleMedium" style={{fontWeight: '600'}}>
                      {getCategoryName(mostCommonCategory)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Upcoming Renewals */}
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              opacity: fadeAnim,
              transform: [{translateY: Animated.multiply(slideAnim, 1.2)}],
            },
          ]}>
          <View style={styles.cardContent}>
            <View style={styles.cardTitleContainer}>
              <Icon
                name="calendar-clock"
                size={22}
                color={theme.colors.primary}
                style={styles.cardIcon}
              />
              <Text variant="titleLarge" style={styles.cardTitle}>
                Upcoming Renewals
              </Text>
            </View>

            <View style={styles.renewalContent}>
              {upcomingRenewals.length > 0 ? (
                upcomingRenewals.map((sub, index) => (
                  <Pressable
                    key={sub.id}
                    style={({pressed}) => [
                      styles.renewalItem,
                      {
                        borderBottomWidth:
                          index < upcomingRenewals.length - 1 ? 1 : 0,
                        opacity: pressed ? 0.7 : 1,
                        backgroundColor: pressed
                          ? `${theme.colors.primary}08`
                          : 'transparent',
                      },
                    ]}
                    onPress={() =>
                      navigation.navigate('SubscriptionDetail', {
                        subscriptionId: sub.id,
                      })
                    }>
                    <View style={styles.renewalInfo}>
                      <Text variant="titleMedium" style={styles.renewalName}>
                        {sub.name}
                      </Text>
                      <View style={styles.dateContainer}>
                        <Icon
                          name="calendar"
                          size={14}
                          color={theme.colors.onSurfaceVariant}
                          style={{marginRight: 4}}
                        />
                        <Text
                          variant="bodyMedium"
                          style={{color: theme.colors.onSurfaceVariant}}>
                          {formatDate(sub.nextBillingDate)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.renewalCost}>
                      <Text
                        variant="titleMedium"
                        style={{
                          color: theme.colors.primary,
                          fontWeight: 'bold',
                        }}>
                        {formatCurrency(
                          sub.cost,
                          currency,
                          sub.originalCurrency,
                        )}
                      </Text>
                      <Icon
                        name="chevron-right"
                        size={20}
                        color={theme.colors.onSurfaceVariant}
                      />
                    </View>
                  </Pressable>
                ))
              ) : (
                <View style={styles.noRenewalsContainer}>
                  <Icon
                    name="calendar-check"
                    size={32}
                    color={theme.colors.primary}
                    style={{marginBottom: 12}}
                  />
                  <Text variant="bodyLarge" style={styles.noRenewalsText}>
                    No upcoming renewals
                  </Text>
                  <Text
                    variant="bodyMedium"
                    style={{
                      color: theme.colors.onSurfaceVariant,
                      textAlign: 'center',
                    }}>
                    You don't have any subscriptions renewing in the next 7 days
                  </Text>
                </View>
              )}
            </View>

            {upcomingRenewals.length > 0 && (
              <Pressable
                style={({pressed}) => [
                  styles.viewAllButton,
                  {
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
                onPress={() => navigation.navigate('Reminders')}>
                <Text style={{color: theme.colors.primary, fontWeight: '600'}}>
                  View All Reminders
                </Text>
                <Icon
                  name="arrow-right"
                  size={18}
                  color={theme.colors.primary}
                  style={{marginLeft: 4}}
                />
              </Pressable>
            )}
          </View>
        </Animated.View>
      </ScrollView>

      <Pressable
        style={({pressed}) => [
          styles.fab,
          {
            backgroundColor: theme.colors.primary,
            opacity: pressed ? 0.9 : 1,
            transform: [{scale: pressed ? 0.96 : 1}],
          },
        ]}
        onPress={() => navigation.navigate('AddSubscription')}>
        <Icon name="plus" size={24} color="white" />
      </Pressable>
    </View>
  );
};

// Helper function to get category name
const getCategoryName = (categoryId: string): string => {
  const CATEGORY_NAMES: Record<string, string> = {
    '1': 'Streaming',
    '2': 'Music',
    '3': 'Newsletter',
    '4': 'Software',
    '5': 'Gaming',
  };

  return CATEGORY_NAMES[categoryId] || 'Other';
};

// Helper function to get category icon
const getCategoryIcon = (categoryId: string): string => {
  const CATEGORY_ICONS: Record<string, string> = {
    '1': 'television-classic',
    '2': 'music',
    '3': 'text',
    '4': 'laptop',
    '5': 'gamepad-variant',
  };

  return CATEGORY_ICONS[categoryId] || 'view-grid';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 2,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 20,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIcon: {
    marginRight: 10,
  },
  cardTitle: {
    fontWeight: 'bold',
  },
  subscriptionStats: {
    marginTop: 12,
  },
  activeCountContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 12,
  },
  categoryIconContainer: {
    backgroundColor: '#f0f0f0',
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  categoryTextContainer: {
    flex: 1,
  },
  renewalContent: {
    paddingVertical: 8,
  },
  renewalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomColor: '#e0e0e0',
    borderRadius: 8,
  },
  renewalInfo: {
    flex: 1,
  },
  renewalName: {
    marginBottom: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  renewalCost: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noRenewalsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  noRenewalsText: {
    marginBottom: 8,
    fontWeight: '600',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
});

export default HomeScreen;
