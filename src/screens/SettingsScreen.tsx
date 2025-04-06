import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TouchableOpacity,
  Animated,
  Switch as RNSwitch,
  Image,
} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import {useAppDispatch, useAppSelector} from '../hooks/useRedux';
import {setTheme, setCurrency} from '../store/slices/settingsSlice';
import {ThemeType} from '../types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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

const SettingsScreen = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const {theme: themePreference, currency} = useAppSelector(
    state => state.settings,
  );

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(currency);

  // Start animation when component mounts
  useEffect(() => {
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
  }, [fadeAnim, slideAnim]);

  const handleThemeChange = (newTheme: ThemeType) => {
    dispatch(setTheme(newTheme));
  };

  const handleCurrencyChange = (newCurrency: string) => {
    setSelectedCurrency(newCurrency);
    dispatch(setCurrency(newCurrency));
    setCurrencyModalVisible(false);
  };

  const isDarkTheme = themePreference === 'dark';
  const isSystemTheme = themePreference === 'system';

  return (
    <View
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <ScrollView style={styles.scrollContent}>
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{translateY: slideAnim}],
            },
          ]}>
          <Text
            variant="titleMedium"
            style={[styles.sectionTitle, {color: theme.colors.primary}]}>
            Appearance
          </Text>

          <Pressable
            style={({pressed}) => [
              styles.settingItem,
              {
                backgroundColor: theme.colors.surface,
                opacity: pressed ? 0.9 : 1,
              },
            ]}>
            <View style={styles.settingIconContainer}>
              <Icon
                name="theme-light-dark"
                size={24}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.settingContent}>
              <Text variant="bodyLarge">Dark Theme</Text>
              <Text
                variant="bodySmall"
                style={{color: theme.colors.onSurfaceVariant}}>
                Use dark theme for the app
              </Text>
            </View>
            <RNSwitch
              value={isDarkTheme}
              onValueChange={value =>
                handleThemeChange(value ? 'dark' : 'light')
              }
              disabled={isSystemTheme}
              trackColor={{false: '#e9e9e9', true: `${theme.colors.primary}50`}}
              thumbColor={isDarkTheme ? theme.colors.primary : '#f4f3f4'}
            />
          </Pressable>

          <Pressable
            style={({pressed}) => [
              styles.settingItem,
              {
                backgroundColor: theme.colors.surface,
                opacity: pressed ? 0.9 : 1,
              },
            ]}>
            <View style={styles.settingIconContainer}>
              <Icon
                name="brightness-auto"
                size={24}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.settingContent}>
              <Text variant="bodyLarge">Use System Theme</Text>
              <Text
                variant="bodySmall"
                style={{color: theme.colors.onSurfaceVariant}}>
                Follow system dark/light mode settings
              </Text>
            </View>
            <RNSwitch
              value={isSystemTheme}
              onValueChange={value =>
                handleThemeChange(
                  value ? 'system' : isDarkTheme ? 'dark' : 'light',
                )
              }
              trackColor={{false: '#e9e9e9', true: `${theme.colors.primary}50`}}
              thumbColor={isSystemTheme ? theme.colors.primary : '#f4f3f4'}
            />
          </Pressable>
        </Animated.View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text
            variant="titleMedium"
            style={[styles.sectionTitle, {color: theme.colors.primary}]}>
            Currency
          </Text>

          <Pressable
            style={({pressed}) => [
              styles.settingItem,
              {
                backgroundColor: theme.colors.surface,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
            onPress={() => setCurrencyModalVisible(true)}>
            <View style={styles.settingIconContainer}>
              <Icon
                name="currency-usd"
                size={24}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.settingContent}>
              <Text variant="bodyLarge">Currency</Text>
              <Text
                variant="bodySmall"
                style={{color: theme.colors.onSurfaceVariant}}>
                {`${
                  CURRENCIES.find(c => c.code === currency)?.name || currency
                } (${CURRENCIES.find(c => c.code === currency)?.symbol || ''})`}
              </Text>
            </View>
            <Icon
              name="chevron-right"
              size={24}
              color={theme.colors.onSurfaceVariant}
            />
          </Pressable>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text
            variant="titleMedium"
            style={[styles.sectionTitle, {color: theme.colors.primary}]}>
            About
          </Text>

          <View
            style={[
              styles.settingItem,
              {backgroundColor: theme.colors.surface},
            ]}>
            <View style={styles.settingIconContainer}>
              <Icon name="information" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text variant="bodyLarge">Version</Text>
              <Text
                variant="bodySmall"
                style={{color: theme.colors.onSurfaceVariant}}>
                1.0.0
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.settingItem,
              {backgroundColor: theme.colors.surface},
            ]}>
            <View style={styles.settingIconContainer}>
              <Image
                source={require('../assets/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.settingContent}>
              <Text variant="bodyLarge">SUBSYNC</Text>
              <Text
                variant="bodySmall"
                style={{color: theme.colors.onSurfaceVariant}}>
                Digital Subscription Management App
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Currency Modal */}
      {currencyModalVisible && (
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setCurrencyModalVisible(false)}
          />
          <Animated.View
            style={[
              styles.modal,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.outline,
              },
            ]}>
            <View style={styles.modalHeader}>
              <Text variant="titleMedium">Select Currency</Text>
              <TouchableOpacity onPress={() => setCurrencyModalVisible(false)}>
                <Icon name="close" size={24} color={theme.colors.onSurface} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.currencyList}>
              {CURRENCIES.map(curr => (
                <Pressable
                  key={curr.code}
                  style={({pressed}) => [
                    styles.currencyOption,
                    selectedCurrency === curr.code && {
                      backgroundColor: `${theme.colors.primary}20`,
                    },
                    pressed && {opacity: 0.7},
                  ]}
                  onPress={() => handleCurrencyChange(curr.code)}>
                  <Text
                    style={[
                      styles.currencyText,
                      selectedCurrency === curr.code && {
                        color: theme.colors.primary,
                        fontWeight: 'bold',
                      },
                    ]}>
                    {`${curr.name} (${curr.symbol})`}
                  </Text>
                  {selectedCurrency === curr.code && (
                    <Icon name="check" size={20} color={theme.colors.primary} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontWeight: 'bold',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 1,
  },
  settingIconContainer: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
    marginHorizontal: 16,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modal: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 12,
    borderWidth: 1,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  currencyList: {
    maxHeight: 300,
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  currencyText: {
    fontSize: 16,
  },
  logoImage: {
    width: 28,
    height: 28,
    backgroundColor: 'transparent',
  },
});

export default SettingsScreen;
