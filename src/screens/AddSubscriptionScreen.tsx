import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  StyleSheet,
  TextInput as RNTextInput,
  Pressable,
  ScrollView,
  Animated,
  Modal,
  TouchableOpacity,
  Switch,
} from 'react-native';
import {Text, useTheme, Button, Divider} from 'react-native-paper';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import {useAppDispatch, useAppSelector} from '../hooks/useRedux';
import {
  addSubscription,
  updateSubscription,
} from '../store/slices/subscriptionSlice';
import {Subscription} from '../types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {SafeAreaView} from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

type AddSubscriptionNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AddSubscription'
>;
type AddSubscriptionRouteProp = RouteProp<
  RootStackParamList,
  'AddSubscription'
>;

// Category definitions with icons
const CATEGORIES = [
  {id: '1', name: 'Streaming', icon: 'television-classic'},
  {id: '2', name: 'Music', icon: 'music'},
  {id: '3', name: 'Newsletter', icon: 'text'},
  {id: '4', name: 'Software', icon: 'laptop'},
  {id: '5', name: 'Gaming', icon: 'gamepad-variant'},
  {id: 'other', name: 'Other', icon: 'star-outline'},
];

const BILLING_CYCLES = [
  {id: 'monthly', name: 'Monthly', days: 30},
  {id: 'quarterly', name: 'Quarterly', days: 90},
  {id: 'biannual', name: 'Biannual', days: 180},
  {id: 'annual', name: 'Annual', days: 365},
  {id: 'custom', name: 'Custom', days: 0},
];

// Currency options list - reusing the same as in SettingsScreen
const CURRENCIES = [
  {code: 'USD', symbol: '$', name: 'US Dollar'},
  {code: 'EUR', symbol: '€', name: 'Euro'},
  {code: 'GBP', symbol: '£', name: 'British Pound'},
  {code: 'JPY', symbol: '¥', name: 'Japanese Yen'},
  {code: 'CAD', symbol: 'C$', name: 'Canadian Dollar'},
  {code: 'AUD', symbol: 'A$', name: 'Australian Dollar'},
  {code: 'INR', symbol: '₹', name: 'Indian Rupee'},
  {code: 'CNY', symbol: '¥', name: 'Chinese Yuan'},
];

const AddSubscriptionScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<AddSubscriptionNavigationProp>();
  const route = useRoute<AddSubscriptionRouteProp>();
  const dispatch = useAppDispatch();
  const {currency: globalCurrency} = useAppSelector(state => state.settings);

  // Check if we're editing an existing subscription
  const isEditing = route.params?.isEditing || false;
  const subscriptionToEdit = route.params?.subscriptionToEdit;

  // Update screen title based on mode
  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Edit Subscription' : 'Add Subscription',
    });
  }, [navigation, isEditing]);

  // Animation
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Form state - initialize with existing data if editing
  const [name, setName] = useState(isEditing ? subscriptionToEdit.name : '');
  const [description, setDescription] = useState(
    isEditing ? subscriptionToEdit.description || '' : '',
  );
  const [cost, setCost] = useState(
    isEditing ? subscriptionToEdit.cost.toString() : '',
  );
  const [currency, setCurrency] = useState(
    isEditing ? subscriptionToEdit.originalCurrency : globalCurrency || 'USD',
  );
  const [url, setUrl] = useState(isEditing ? subscriptionToEdit.url || '' : '');
  const [selectedCategory, setSelectedCategory] = useState(
    isEditing ? subscriptionToEdit.category : CATEGORIES[0].id,
  );
  const [billingCycle, setBillingCycle] = useState(
    isEditing ? subscriptionToEdit.billingCycle : BILLING_CYCLES[0].id,
  );
  const [customBillingDays, setCustomBillingDays] = useState(
    isEditing && subscriptionToEdit.customBillingDays
      ? subscriptionToEdit.customBillingDays.toString()
      : '',
  );
  const [startDate, setStartDate] = useState(
    isEditing ? new Date(subscriptionToEdit.startDate) : new Date(),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [autoRenew, setAutoRenew] = useState(
    isEditing ? subscriptionToEdit.autoRenew : true,
  );
  const [reminderDays, setReminderDays] = useState(
    isEditing
      ? subscriptionToEdit.reminderSettings.daysInAdvance.toString()
      : '3',
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [billingCycleModalVisible, setBillingCycleModalVisible] =
    useState(false);

  // Extract custom category name from notes if present
  const [customCategoryName, setCustomCategoryName] = useState(() => {
    if (isEditing && selectedCategory === 'other' && subscriptionToEdit.notes) {
      const match = subscriptionToEdit.notes.match(/Custom category: (.+)/);
      return match ? match[1] : '';
    }
    return '';
  });

  // Start animation when component mounts
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, []);

  // Get conversion rate (simplified example)
  const getConversionRate = (from: string, to: string): number => {
    if (from === to) return 1;

    const rates: Record<string, number> = {
      USD: 1,
      EUR: 0.92,
      GBP: 0.79,
      JPY: 151.27,
    };

    if (!rates[from] || !rates[to]) return 1;

    return rates[to] / rates[from];
  };

  // Convert to display currency
  const convertCurrency = (value: string, from: string, to: string): string => {
    if (!value) return '';
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '';

    const rate = getConversionRate(from, to);
    return (numValue * rate).toFixed(2);
  };

  // Format date
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate next billing date based on start date and billing cycle
  const calculateNextBillingDate = (): string => {
    const next = new Date(startDate);
    let days = 30; // default monthly

    const selectedCycle = BILLING_CYCLES.find(
      cycle => cycle.id === billingCycle,
    );
    if (selectedCycle) {
      days = selectedCycle.days;
    }

    if (billingCycle === 'custom' && customBillingDays) {
      days = parseInt(customBillingDays, 10);
      if (isNaN(days)) days = 30;
    }

    next.setDate(next.getDate() + days);
    return next.toISOString();
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!cost.trim()) {
      newErrors.cost = 'Cost is required';
    } else if (isNaN(parseFloat(cost)) || parseFloat(cost) < 0) {
      newErrors.cost = 'Cost must be a positive number';
    }

    if (
      billingCycle === 'custom' &&
      (!customBillingDays || isNaN(parseInt(customBillingDays, 10)))
    ) {
      newErrors.customBillingDays = 'Please enter a valid number of days';
    }

    if (url && !url.startsWith('http')) {
      newErrors.url =
        'Please enter a valid URL starting with http:// or https://';
    }

    if (reminderDays && isNaN(parseInt(reminderDays, 10))) {
      newErrors.reminderDays = 'Please enter a valid number of days';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) return;

    // Convert string values to appropriate types
    const subscriptionData = {
      name: name.trim(),
      description: description.trim(),
      cost: parseFloat(cost),
      originalCurrency: currency,
      billingCycle: billingCycle as any, // Temporary fix for type error
      customBillingDays:
        billingCycle === 'custom' ? parseInt(customBillingDays, 10) : undefined,
      category: selectedCategory,
      startDate: startDate.toISOString(),
      nextBillingDate: calculateNextBillingDate(),
      url: url.trim(),
      notes:
        selectedCategory === 'other'
          ? `Custom category: ${customCategoryName.trim()}`
          : '',
      logoUrl: undefined,
      color: undefined,
      active: true,
      autoRenew: autoRenew,
      reminderSettings: {
        enabled: true,
        daysInAdvance: parseInt(reminderDays, 10) || 3,
      },
    };

    if (isEditing) {
      // Update existing subscription
      dispatch(
        updateSubscription({
          ...subscriptionData,
          id: subscriptionToEdit.id,
          // Preserve any fields we don't want to change
          active: subscriptionToEdit.active,
        }),
      );
    } else {
      // Add new subscription
      dispatch(addSubscription(subscriptionData));
    }

    navigation.goBack();
  };

  // Get color for selected category
  const getCategoryColor = (id: string): string => {
    return id === selectedCategory ? theme.colors.primary : '#666';
  };

  // Get label for selected billing cycle
  const getBillingCycleLabel = (): string => {
    const cycle = BILLING_CYCLES.find(c => c.id === billingCycle);
    return cycle ? cycle.name : 'Monthly';
  };

  // Handle date change
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  // Get category name (handles custom "Other" category)
  const getCategoryName = (categoryId: string): string => {
    if (categoryId === 'other' && customCategoryName.trim()) {
      return customCategoryName.trim();
    }
    const category = CATEGORIES.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <Animated.View
        style={[
          styles.content,
          {
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [300, 0],
                }),
              },
            ],
          },
        ]}>
        <ScrollView style={styles.form}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Icon
                  name="tag-outline"
                  size={20}
                  color={theme.colors.primary}
                  style={styles.labelIcon}
                />
                <Text style={styles.label}>Name</Text>
              </View>
              <RNTextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={name}
                onChangeText={setName}
                placeholder="Enter subscription name"
                placeholderTextColor="#999"
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Icon
                  name="shape-outline"
                  size={20}
                  color={theme.colors.primary}
                  style={styles.labelIcon}
                />
                <Text style={styles.label}>Category</Text>
              </View>
              <View style={styles.categories}>
                {CATEGORIES.map(category => (
                  <Pressable
                    key={category.id}
                    style={[
                      styles.categoryItem,
                      selectedCategory === category.id && [
                        styles.selectedCategory,
                        {
                          borderColor: theme.colors.primary,
                          backgroundColor: `${theme.colors.primary}10`,
                        },
                      ],
                    ]}
                    onPress={() => setSelectedCategory(category.id)}>
                    <Icon
                      name={category.icon}
                      size={24}
                      color={getCategoryColor(category.id)}
                    />
                    <Text
                      style={[
                        styles.categoryText,
                        selectedCategory === category.id && {
                          color: theme.colors.primary,
                        },
                      ]}>
                      {getCategoryName(category.id)}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {selectedCategory === 'other' && (
                <View style={styles.customCategoryContainer}>
                  <RNTextInput
                    style={styles.input}
                    value={customCategoryName}
                    onChangeText={setCustomCategoryName}
                    placeholder="Enter custom category name"
                    placeholderTextColor="#999"
                  />
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Icon
                  name="text-box-outline"
                  size={20}
                  color={theme.colors.primary}
                  style={styles.labelIcon}
                />
                <Text style={styles.label}>Description (Optional)</Text>
              </View>
              <RNTextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Add notes about this subscription"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Icon
                  name="link-variant"
                  size={20}
                  color={theme.colors.primary}
                  style={styles.labelIcon}
                />
                <Text style={styles.label}>Website URL (Optional)</Text>
              </View>
              <RNTextInput
                style={[styles.input, errors.url && styles.inputError]}
                value={url}
                onChangeText={setUrl}
                placeholder="https://example.com"
                placeholderTextColor="#999"
                autoCapitalize="none"
                keyboardType="url"
              />
              {errors.url && <Text style={styles.errorText}>{errors.url}</Text>}
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Billing Details</Text>

            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Icon
                  name="currency-usd"
                  size={20}
                  color={theme.colors.primary}
                  style={styles.labelIcon}
                />
                <Text style={styles.label}>Cost</Text>
              </View>
              <View style={styles.costContainer}>
                <RNTextInput
                  style={[
                    styles.input,
                    styles.costInput,
                    errors.cost && styles.inputError,
                  ]}
                  value={cost}
                  onChangeText={setCost}
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                />
                <Pressable
                  style={[
                    styles.currencyToggle,
                    {backgroundColor: theme.colors.primary},
                  ]}
                  onPress={() => setCurrencyModalVisible(true)}>
                  <Text style={styles.currencyText}>{currency}</Text>
                </Pressable>
              </View>
              {errors.cost && (
                <Text style={styles.errorText}>{errors.cost}</Text>
              )}

              {currency !== 'USD' && cost && !isNaN(parseFloat(cost)) && (
                <Text style={styles.conversionText}>
                  ≈ ${convertCurrency(cost, currency, 'USD')} USD
                </Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Icon
                  name="calendar-refresh"
                  size={20}
                  color={theme.colors.primary}
                  style={styles.labelIcon}
                />
                <Text style={styles.label}>Billing Cycle</Text>
              </View>
              <Pressable
                style={styles.pickerButton}
                onPress={() => setBillingCycleModalVisible(true)}>
                <Text style={styles.pickerButtonText}>
                  {getBillingCycleLabel()}
                </Text>
                <Icon name="chevron-down" size={20} color="#666" />
              </Pressable>

              {billingCycle === 'custom' && (
                <View style={styles.customDaysContainer}>
                  <RNTextInput
                    style={[
                      styles.input,
                      styles.customDaysInput,
                      errors.customBillingDays && styles.inputError,
                    ]}
                    value={customBillingDays}
                    onChangeText={setCustomBillingDays}
                    placeholder="Number of days"
                    placeholderTextColor="#999"
                    keyboardType="number-pad"
                  />
                  <Text style={styles.customDaysLabel}>days</Text>
                </View>
              )}
              {errors.customBillingDays && (
                <Text style={styles.errorText}>{errors.customBillingDays}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Icon
                  name="calendar-today"
                  size={20}
                  color={theme.colors.primary}
                  style={styles.labelIcon}
                />
                <Text style={styles.label}>Start Date</Text>
              </View>
              <Pressable
                style={styles.pickerButton}
                onPress={() => setShowDatePicker(true)}>
                <Text style={styles.pickerButtonText}>
                  {formatDate(startDate)}
                </Text>
                <Icon name="calendar" size={20} color="#666" />
              </Pressable>

              {showDatePicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Icon
                  name="bell-outline"
                  size={20}
                  color={theme.colors.primary}
                  style={styles.labelIcon}
                />
                <Text style={styles.label}>Reminder Settings</Text>
              </View>
              <View style={styles.reminderContainer}>
                <RNTextInput
                  style={[
                    styles.input,
                    styles.reminderInput,
                    errors.reminderDays && styles.inputError,
                  ]}
                  value={reminderDays}
                  onChangeText={setReminderDays}
                  placeholder="3"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                />
                <Text style={styles.reminderLabel}>days before renewal</Text>
              </View>
              {errors.reminderDays && (
                <Text style={styles.errorText}>{errors.reminderDays}</Text>
              )}
            </View>

            <View style={styles.switchContainer}>
              <View style={styles.switchLabel}>
                <Icon
                  name="refresh"
                  size={20}
                  color={theme.colors.primary}
                  style={styles.labelIcon}
                />
                <Text style={styles.label}>Auto-Renew</Text>
              </View>
              <Switch
                value={autoRenew}
                onValueChange={setAutoRenew}
                trackColor={{
                  false: '#e9e9e9',
                  true: `${theme.colors.primary}50`,
                }}
                thumbColor={autoRenew ? theme.colors.primary : '#f4f3f4'}
              />
            </View>
          </View>

          <Divider style={styles.divider} />

          <Pressable
            style={[
              styles.submitButton,
              {backgroundColor: theme.colors.primary},
            ]}
            onPress={handleSubmit}>
            <Icon
              name="check"
              size={20}
              color="white"
              style={{marginRight: 8}}
            />
            <Text style={styles.submitButtonText}>Add Subscription</Text>
          </Pressable>
        </ScrollView>
      </Animated.View>

      {/* Currency Modal */}
      <Modal
        visible={currencyModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCurrencyModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setCurrencyModalVisible(false)}
          />
          <View style={[styles.modal, {backgroundColor: 'white'}]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Currency</Text>
              <TouchableOpacity onPress={() => setCurrencyModalVisible(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {CURRENCIES.map(curr => (
                <Pressable
                  key={curr.code}
                  style={({pressed}) => [
                    styles.modalOption,
                    currency === curr.code && {
                      backgroundColor: `${theme.colors.primary}20`,
                    },
                    pressed && {opacity: 0.7},
                  ]}
                  onPress={() => {
                    setCurrency(curr.code);
                    setCurrencyModalVisible(false);
                  }}>
                  <Text
                    style={[
                      styles.modalOptionText,
                      currency === curr.code && {
                        color: theme.colors.primary,
                        fontWeight: 'bold',
                      },
                    ]}>
                    {`${curr.name} (${curr.symbol})`}
                  </Text>
                  {currency === curr.code && (
                    <Icon name="check" size={20} color={theme.colors.primary} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Billing Cycle Modal */}
      <Modal
        visible={billingCycleModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setBillingCycleModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setBillingCycleModalVisible(false)}
          />
          <View style={[styles.modal, {backgroundColor: 'white'}]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Billing Cycle</Text>
              <TouchableOpacity
                onPress={() => setBillingCycleModalVisible(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {BILLING_CYCLES.map(cycle => (
                <Pressable
                  key={cycle.id}
                  style={({pressed}) => [
                    styles.modalOption,
                    billingCycle === cycle.id && {
                      backgroundColor: `${theme.colors.primary}20`,
                    },
                    pressed && {opacity: 0.7},
                  ]}
                  onPress={() => {
                    setBillingCycle(cycle.id);
                    setBillingCycleModalVisible(false);
                  }}>
                  <Text
                    style={[
                      styles.modalOptionText,
                      billingCycle === cycle.id && {
                        color: theme.colors.primary,
                        fontWeight: 'bold',
                      },
                    ]}>
                    {cycle.name}
                    {cycle.id !== 'custom' && ` (${cycle.days} days)`}
                  </Text>
                  {billingCycle === cycle.id && (
                    <Icon name="check" size={20} color={theme.colors.primary} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelIcon: {
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 80,
    paddingTop: 12,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  costContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  costInput: {
    flex: 1,
  },
  currencyToggle: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencyText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  conversionText: {
    marginTop: 4,
    color: '#666',
    fontSize: 12,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  customDaysContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  customDaysInput: {
    flex: 1,
    marginRight: 8,
  },
  customDaysLabel: {
    fontSize: 16,
    color: '#666',
    width: 60,
  },
  reminderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderInput: {
    width: 80,
    marginRight: 8,
  },
  reminderLabel: {
    fontSize: 16,
    color: '#666',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  categoryItem: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    width: '30%',
  },
  selectedCategory: {
    borderColor: '#2ecc71',
    backgroundColor: '#f0fff4',
  },
  categoryText: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
  },
  submitButton: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modal: {
    width: '85%',
    maxHeight: '70%',
    borderRadius: 12,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalList: {
    maxHeight: 300,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalOptionText: {
    fontSize: 16,
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  currencyOptionText: {
    fontSize: 16,
  },
  customCategoryContainer: {
    marginTop: 12,
  },
});

export default AddSubscriptionScreen;
