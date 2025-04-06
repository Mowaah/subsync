import React, {useState, useEffect, useRef} from 'react';
import {View, StyleSheet, Pressable, ScrollView, Animated} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {CompositeNavigationProp} from '@react-navigation/native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {RootStackParamList, MainTabParamList} from '../navigation/AppNavigator';
import {useAppSelector, useAppDispatch} from '../hooks/useRedux';
import {fetchSubscriptions} from '../store/slices/subscriptionSlice';
import {formatCurrency} from '../utils/subscriptionUtils';
import {Subscription} from '../types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Define a composite navigation type
type SubscriptionsScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Subscriptions'>,
  NativeStackNavigationProp<RootStackParamList>
>;

// Category definitions with icons
const CATEGORIES = [
  {id: 'all', name: 'All', icon: 'view-grid'},
  {id: '1', name: 'Streaming', icon: 'television-classic'},
  {id: '2', name: 'Music', icon: 'music'},
  {id: '3', name: 'Newsletter', icon: 'text'},
  {id: '4', name: 'Software', icon: 'laptop'},
  {id: '5', name: 'Gaming', icon: 'gamepad-variant'},
];

const SubscriptionsScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<SubscriptionsScreenNavigationProp>();
  const dispatch = useAppDispatch();

  // Ensure header is visible and properly styled
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
    });
  }, [navigation]);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const {
    items: subscriptions,
    status,
    categories,
  } = useAppSelector(state => state.subscriptions);
  const {currency} = useAppSelector(state => state.settings);

  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch subscriptions when component mounts
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchSubscriptions());
    }

    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [dispatch, status, fadeAnim, slideAnim]);

  // Filter subscriptions by category
  const filteredSubscriptions = subscriptions.filter(sub => {
    if (selectedCategory === 'all') {
      return true;
    }
    return sub.category === selectedCategory;
  });

  // Calculate monthly total
  const monthlyTotal = filteredSubscriptions.reduce((total, sub) => {
    // For simplicity, we're considering all as monthly
    return total + sub.cost;
  }, 0);

  // Get days until renewal
  const getDaysUntilRenewal = (nextBillingDate: string) => {
    const today = new Date();
    const renewalDate = new Date(nextBillingDate);
    const diffTime = Math.abs(renewalDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get icon for category
  const getCategoryIcon = (categoryId: string) => {
    const category = CATEGORIES.find(cat => cat.id === categoryId);
    return category ? category.icon : 'help-circle';
  };

  // Render a category chip
  const renderCategoryChip = (category: (typeof CATEGORIES)[0]) => {
    const isSelected = selectedCategory === category.id;
    return (
      <Pressable
        key={category.id}
        style={[
          styles.categoryChip,
          isSelected && {
            backgroundColor: theme.colors.primary,
          },
        ]}
        onPress={() => setSelectedCategory(category.id)}>
        <Text
          style={[
            styles.categoryChipText,
            isSelected && {
              color: 'white',
            },
          ]}>
          {category.name}
        </Text>
      </Pressable>
    );
  };

  // Render a subscription item
  const renderSubscriptionItem = (item: Subscription) => {
    const daysUntilRenewal = getDaysUntilRenewal(item.nextBillingDate);
    const categoryIcon = getCategoryIcon(item.category);

    return (
      <Pressable
        style={({pressed}) => [
          styles.subscriptionCard,
          {
            opacity: pressed ? 0.9 : 1,
            transform: [{scale: pressed ? 0.98 : 1}],
          },
        ]}
        onPress={() =>
          navigation.navigate('SubscriptionDetail', {
            subscriptionId: item.id,
          })
        }>
        <View style={styles.cardIconContainer}>
          <Icon name={categoryIcon} size={24} color="#666" />
        </View>
        <View style={styles.cardMiddle}>
          <Text style={styles.subscriptionName}>{item.name}</Text>
          <Text style={styles.renewalText}>
            Renews in {daysUntilRenewal} days{' '}
            <View style={styles.activeIndicator} />
          </Text>
        </View>
        <Text style={styles.costText}>
          {formatCurrency(item.cost, currency, item.originalCurrency)}/mo
        </Text>
      </Pressable>
    );
  };

  return (
    <View
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{translateY: slideAnim}],
        }}>
        {/* Monthly Total and Filters Container */}
        <View style={[styles.whiteContainer, {backgroundColor: 'white'}]}>
          {/* Monthly Total Section */}
          <View style={styles.monthlyTotalSection}>
            <View style={styles.monthlyTotalRow}>
              <Text style={styles.monthlyTotalLabel}>Monthly Total: </Text>
              <Text style={[styles.monthlyTotalAmount, {color: '#4F55D9'}]}>
                {formatCurrency(monthlyTotal, currency)}
              </Text>
            </View>
          </View>

          {/* Category Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryContentContainer}>
            {CATEGORIES.map(category => renderCategoryChip(category))}
          </ScrollView>
        </View>

        {/* Subscription List */}
        <ScrollView style={styles.listContainer}>
          {filteredSubscriptions.map(item => (
            <View key={item.id}>{renderSubscriptionItem(item)}</View>
          ))}
          {filteredSubscriptions.length === 0 && (
            <View style={styles.emptyContainer}>
              <Icon name="credit-card-off" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No subscriptions found</Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  whiteContainer: {
    backgroundColor: 'white',
    marginBottom: 8,
  },
  monthlyTotalSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  monthlyTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthlyTotalLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
  },
  monthlyTotalAmount: {
    fontSize: 28,
    fontWeight: '700',
  },
  categoryContentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#eee',
    borderRadius: 30,
    marginRight: 8,
  },
  categoryChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  subscriptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardIconContainer: {
    width: 40,
    alignItems: 'center',
  },
  cardMiddle: {
    flex: 1,
    marginLeft: 12,
  },
  subscriptionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  renewalText: {
    fontSize: 14,
    color: '#666',
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CD964',
    marginLeft: 4,
  },
  costText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#999',
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
    elevation: 4,
  },
});

export default SubscriptionsScreen;
