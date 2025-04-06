import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Provider as PaperProvider} from 'react-native-paper';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {useAppTheme} from '../hooks/useTheme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import screens (to be created)
import HomeScreen from '../screens/HomeScreen';
import SubscriptionsScreen from '../screens/SubscriptionsScreen';
import AddSubscriptionScreen from '../screens/AddSubscriptionScreen';
import SubscriptionDetailScreen from '../screens/SubscriptionDetailScreen';
import ReminderScreen from '../screens/ReminderScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Stack navigator type definitions
export type RootStackParamList = {
  MainTabs: undefined;
  AddSubscription:
    | {
        subscriptionToEdit?: any; // Will be replaced with proper type
        isEditing?: boolean;
      }
    | undefined;
  SubscriptionDetail: {subscriptionId: string};
  Settings: undefined;
};

// Tab navigator type definitions
export type MainTabParamList = {
  Home: undefined;
  Subscriptions: undefined;
  Reminders: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab Navigator
const MainTabs = () => {
  const {theme, isDarkMode} = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.placeholder,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
        },
        headerStyle: {
          backgroundColor: theme.colors.card,
        },
        headerTintColor: theme.colors.text,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Subscriptions"
        component={SubscriptionsScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="credit-card-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Reminders"
        component={ReminderScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="bell-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Root navigator with theme support
export const AppNavigator = () => {
  const {theme} = useAppTheme();

  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <NavigationContainer theme={theme}>
          <Stack.Navigator
            screenOptions={{
              headerStyle: {
                backgroundColor: theme.colors.card,
              },
              headerTintColor: theme.colors.text,
              contentStyle: {
                backgroundColor: theme.colors.background,
              },
            }}>
            <Stack.Screen
              name="MainTabs"
              component={MainTabs}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="AddSubscription"
              component={AddSubscriptionScreen}
              options={{title: 'Add Subscription'}}
            />
            <Stack.Screen
              name="SubscriptionDetail"
              component={SubscriptionDetailScreen}
              options={{title: 'Subscription Details'}}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{title: 'Settings'}}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </PaperProvider>
  );
};

export default AppNavigator;
