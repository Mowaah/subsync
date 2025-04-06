import React, {useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  ScrollView,
  Animated,
} from 'react-native';
import {Text, useTheme, Divider, Button} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {CompositeNavigationProp} from '@react-navigation/native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {RootStackParamList, MainTabParamList} from '../navigation/AppNavigator';
import {useAppSelector, useAppDispatch} from '../hooks/useRedux';
import {fetchSubscriptions} from '../store/slices/subscriptionSlice';
import {formatCurrency, formatDate} from '../utils/subscriptionUtils';
import {Subscription} from '../types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Define a composite navigation type
type ReminderScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Reminders'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const ReminderScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<ReminderScreenNavigationProp>();
  const dispatch = useAppDispatch();

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const {
    items: subscriptions,
    status,
    categories,
  } = useAppSelector(state => state.subscriptions);
  const {currency} = useAppSelector(state => state.settings);

  // Fetch subscriptions when component mounts
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchSubscriptions());
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

  // Get active subscriptions and sort by upcoming renewals
  const activeSubscriptions = subscriptions
    .filter(sub => sub.active)
    .sort(
      (a, b) =>
        new Date(a.nextBillingDate).getTime() -
        new Date(b.nextBillingDate).getTime(),
    );

  const today = new Date();
  const oneWeek = new Date();
  oneWeek.setDate(today.getDate() + 7);
  const oneMonth = new Date();
  oneMonth.setDate(today.getDate() + 30);

  // Group subscriptions by renewal timeframe
  const thisWeek = activeSubscriptions.filter(
    sub => new Date(sub.nextBillingDate) <= oneWeek,
  );

  const thisMonth = activeSubscriptions.filter(sub => {
    const date = new Date(sub.nextBillingDate);
    return date > oneWeek && date <= oneMonth;
  });

  const later = activeSubscriptions.filter(
    sub => new Date(sub.nextBillingDate) > oneMonth,
  );

  const renderHeader = (
    title: string,
    subscriptions: Subscription[],
    color: string,
  ) => {
    if (subscriptions.length === 0) return null;

    return (
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <View style={[styles.sectionIndicator, {backgroundColor: color}]} />
          <Text variant="titleMedium" style={{fontWeight: 'bold'}}>
            {title}
          </Text>
        </View>
        <Text
          variant="bodyMedium"
          style={{color: theme.colors.onSurfaceVariant}}>
          {subscriptions.length}{' '}
          {subscriptions.length === 1 ? 'subscription' : 'subscriptions'}
        </Text>
      </View>
    );
  };

  const renderSubscriptionItem = (
    item: Subscription,
    urgencyLevel: 'high' | 'medium' | 'low',
  ) => {
    const categoryObj = categories.find(cat => cat.id === item.category);
    const categoryColor = categoryObj?.color || theme.colors.primary;

    // Calculate days until renewal
    const today = new Date();
    const renewalDate = new Date(item.nextBillingDate);
    const daysUntil = Math.ceil(
      (renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    let renewalText = '';
    let textColor = theme.colors.primary;
    let urgencyColor = '';
    let urgencyIcon = '';

    // Set colors and text based on urgency
    if (urgencyLevel === 'high') {
      urgencyColor = theme.colors.error;
      urgencyIcon = 'alert-circle';

      if (daysUntil < 0) {
        renewalText = 'Overdue';
      } else if (daysUntil === 0) {
        renewalText = 'Today';
      } else if (daysUntil === 1) {
        renewalText = 'Tomorrow';
      } else {
        renewalText = `In ${daysUntil} days`;
      }

      textColor = theme.colors.error;
    } else if (urgencyLevel === 'medium') {
      urgencyColor = '#FB8C00';
      urgencyIcon = 'clock-alert';
      renewalText = formatDate(item.nextBillingDate);
      textColor = '#FB8C00';
    } else {
      urgencyColor = theme.colors.primary;
      urgencyIcon = 'calendar-clock';
      renewalText = formatDate(item.nextBillingDate);
      textColor = theme.colors.primary;
    }

    return (
      <Pressable
        style={({pressed}) => [
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            opacity: pressed ? 0.9 : 1,
            transform: [{scale: pressed ? 0.98 : 1}],
          },
        ]}
        onPress={() =>
          navigation.navigate('SubscriptionDetail', {subscriptionId: item.id})
        }>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text variant="titleMedium">{item.name}</Text>
            <View
              style={[
                styles.categoryBadge,
                {backgroundColor: `${categoryColor}20`},
              ]}>
              <View
                style={[styles.categoryDot, {backgroundColor: categoryColor}]}
              />
              <Text style={{color: categoryColor, fontSize: 12}}>
                {categoryObj?.name || 'Category'}
              </Text>
            </View>
          </View>
          <Text
            variant="titleMedium"
            style={{color: theme.colors.primary, fontWeight: 'bold'}}>
            {formatCurrency(item.cost, currency, item.originalCurrency)}
          </Text>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.cardFooter}>
          <View style={styles.renewalContainer}>
            <Icon
              name={urgencyIcon}
              size={20}
              color={urgencyColor}
              style={styles.renewalIcon}
            />
            <View>
              <Text
                variant="bodySmall"
                style={{color: theme.colors.onSurfaceVariant}}>
                Next renewal:
              </Text>
              <Text
                variant="bodyMedium"
                style={{fontWeight: 'bold', color: textColor}}>
                {renewalText}
              </Text>
            </View>
          </View>
          <Icon
            name="chevron-right"
            size={20}
            color={theme.colors.onSurfaceVariant}
          />
        </View>
      </Pressable>
    );
  };

  const renderSectionWithItems = (
    title: string,
    data: Subscription[],
    urgencyLevel: 'high' | 'medium' | 'low',
    color: string,
  ) => {
    if (data.length === 0) return null;

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{translateY: slideAnim}],
        }}>
        {renderHeader(title, data, color)}
        {data.map(item => (
          <View key={item.id}>
            {renderSubscriptionItem(item, urgencyLevel)}
          </View>
        ))}
        <View style={styles.sectionDivider} />
      </Animated.View>
    );
  };

  return (
    <View
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineSmall" style={styles.pageTitle}>
          Upcoming Renewals
        </Text>

        {activeSubscriptions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon
              name="calendar-blank"
              size={64}
              color={theme.colors.primary}
              style={{marginBottom: 16}}
            />
            <Text variant="titleMedium" style={{marginBottom: 8}}>
              No active subscriptions
            </Text>
            <Text
              variant="bodyMedium"
              style={{
                marginBottom: 24,
                textAlign: 'center',
                color: theme.colors.onSurfaceVariant,
              }}>
              Add your subscriptions to track renewal dates
            </Text>
            <Pressable
              style={[
                styles.addButton,
                {backgroundColor: theme.colors.primary},
              ]}
              onPress={() => navigation.navigate('AddSubscription')}>
              <Icon
                name="plus"
                size={20}
                color="white"
                style={{marginRight: 8}}
              />
              <Text style={styles.addButtonText}>Add Subscription</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {renderSectionWithItems(
              'Due This Week',
              thisWeek,
              'high',
              theme.colors.error,
            )}
            {renderSectionWithItems(
              'Due This Month',
              thisMonth,
              'medium',
              '#FB8C00',
            )}
            {renderSectionWithItems(
              'Due Later',
              later,
              'low',
              theme.colors.primary,
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  pageTitle: {
    marginBottom: 24,
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIndicator: {
    width: 4,
    height: 18,
    borderRadius: 2,
    marginRight: 8,
  },
  card: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  titleContainer: {
    flex: 1,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  divider: {
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  renewalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  renewalIcon: {
    marginRight: 8,
  },
  sectionDivider: {
    height: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ReminderScreen;
