import React, {useEffect, useState} from 'react';
import {View, StyleSheet, ScrollView, Alert, ToastAndroid} from 'react-native';
import {
  Text,
  Card,
  Button,
  Divider,
  IconButton,
  Menu,
  useTheme,
  FAB,
  Dialog,
  Portal,
  Paragraph,
} from 'react-native-paper';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import {useAppDispatch, useAppSelector} from '../hooks/useRedux';
import {
  deleteSubscription,
  updateSubscription,
} from '../store/slices/subscriptionSlice';
import {
  formatCurrency,
  formatDate,
  calculateAnnualCost,
} from '../utils/subscriptionUtils';

type SubscriptionDetailRouteProp = RouteProp<
  RootStackParamList,
  'SubscriptionDetail'
>;
type SubscriptionDetailNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

const SubscriptionDetailScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<SubscriptionDetailNavigationProp>();
  const route = useRoute<SubscriptionDetailRouteProp>();
  const dispatch = useAppDispatch();

  const {subscriptionId} = route.params;

  const {items: subscriptions, categories} = useAppSelector(
    state => state.subscriptions,
  );
  const {currency} = useAppSelector(state => state.settings);

  const subscription = subscriptions.find(sub => sub.id === subscriptionId);

  const [menuVisible, setMenuVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  useEffect(() => {
    // Set the header title to the subscription name
    if (subscription) {
      navigation.setOptions({
        title: subscription.name,
        headerRight: () => (
          <IconButton
            icon="dots-vertical"
            onPress={() => setMenuVisible(true)}
          />
        ),
      });
    }
  }, [navigation, subscription]);

  if (!subscription) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Subscription not found</Text>
      </View>
    );
  }

  const category = categories.find(cat => cat.id === subscription.category);
  const annualCost = calculateAnnualCost(
    subscription.cost,
    subscription.billingCycle,
    subscription.customBillingDays,
    subscription.originalCurrency,
    currency,
  );

  const toggleActive = () => {
    dispatch(
      updateSubscription({
        ...subscription,
        active: !subscription.active,
      }),
    );
  };

  const handleDelete = () => {
    dispatch(deleteSubscription(subscription.id));
    navigation.goBack();
    ToastAndroid.show('Subscription deleted', ToastAndroid.SHORT);
  };

  // Format billing cycle for display
  const getBillingCycleText = () => {
    switch (subscription.billingCycle) {
      case 'monthly':
        return 'Monthly';
      case 'quarterly':
        return 'Every 3 months';
      case 'yearly':
        return 'Yearly';
      case 'custom':
        return `Every ${subscription.customBillingDays} days`;
      default:
        return subscription.billingCycle;
    }
  };

  const handleEdit = () => {
    navigation.navigate('AddSubscription', {
      subscriptionToEdit: subscription,
      isEditing: true,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status Card */}
        <Card style={[styles.card, {backgroundColor: theme.colors.surface}]}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View>
                <Text variant="titleMedium">Status</Text>
                <Text
                  variant="headlineSmall"
                  style={{
                    color: subscription.active
                      ? theme.colors.primary
                      : theme.colors.error,
                  }}>
                  {subscription.active ? 'Active' : 'Inactive'}
                </Text>
              </View>
              <Button
                mode={subscription.active ? 'outlined' : 'contained'}
                onPress={toggleActive}>
                {subscription.active ? 'Deactivate' : 'Activate'}
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Cost Card */}
        <Card style={[styles.card, {backgroundColor: theme.colors.surface}]}>
          <Card.Content>
            <Text variant="titleMedium">Cost</Text>
            <View style={styles.costContainer}>
              <View>
                <Text
                  variant="displaySmall"
                  style={{color: theme.colors.primary}}>
                  {formatCurrency(
                    subscription.cost,
                    currency,
                    subscription.originalCurrency,
                  )}
                </Text>
                <Text variant="bodyMedium">{getBillingCycleText()}</Text>
              </View>
              <View style={styles.annualCostContainer}>
                <Text
                  variant="titleMedium"
                  style={{color: theme.colors.primary}}>
                  {formatCurrency(
                    annualCost,
                    currency,
                    subscription.originalCurrency,
                  )}
                </Text>
                <Text variant="bodyMedium">per year</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Details Card */}
        <Card style={[styles.card, {backgroundColor: theme.colors.surface}]}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Details
            </Text>

            <View style={styles.detailRow}>
              <Text variant="bodyMedium">Category</Text>
              <Text
                variant="bodyMedium"
                style={{
                  color: category?.color || theme.colors.primary,
                  fontWeight: 'bold',
                }}>
                {category?.name || 'Other'}
              </Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.detailRow}>
              <Text variant="bodyMedium">Started on</Text>
              <Text variant="bodyMedium">
                {formatDate(subscription.startDate)}
              </Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.detailRow}>
              <Text variant="bodyMedium">Next billing date</Text>
              <Text variant="bodyMedium" style={{fontWeight: 'bold'}}>
                {formatDate(subscription.nextBillingDate)}
              </Text>
            </View>

            {subscription.url && (
              <>
                <Divider style={styles.divider} />
                <View style={styles.detailRow}>
                  <Text variant="bodyMedium">Website</Text>
                  <Text
                    variant="bodyMedium"
                    style={{color: theme.colors.primary}}
                    onPress={() => {
                      // Handle opening URL (implement later)
                    }}>
                    Visit
                  </Text>
                </View>
              </>
            )}

            {subscription.notes && (
              <>
                <Divider style={styles.divider} />
                <View style={styles.notesContainer}>
                  <Text variant="bodyMedium">Notes</Text>
                  <Text variant="bodyMedium" style={styles.notesText}>
                    {subscription.notes}
                  </Text>
                </View>
              </>
            )}
          </Card.Content>
        </Card>

        {/* Reminder Settings */}
        <Card style={[styles.card, {backgroundColor: theme.colors.surface}]}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Reminder Settings
            </Text>

            <View style={styles.detailRow}>
              <Text variant="bodyMedium">Reminders</Text>
              <Text variant="bodyMedium">
                {subscription.reminderSettings.enabled ? 'Enabled' : 'Disabled'}
              </Text>
            </View>

            {subscription.reminderSettings.enabled && (
              <>
                <Divider style={styles.divider} />
                <View style={styles.detailRow}>
                  <Text variant="bodyMedium">Remind me</Text>
                  <Text variant="bodyMedium">
                    {subscription.reminderSettings.daysInAdvance} days before
                  </Text>
                </View>
              </>
            )}
          </Card.Content>
        </Card>

        {/* Danger Zone */}
        <Card
          style={[
            styles.dangerCard,
            {backgroundColor: theme.colors.errorContainer},
          ]}>
          <Card.Content>
            <Text
              variant="titleMedium"
              style={[styles.sectionTitle, {color: theme.colors.error}]}>
              Danger Zone
            </Text>

            <Button
              mode="contained"
              buttonColor={theme.colors.error}
              textColor={theme.colors.onError}
              style={styles.deleteButton}
              onPress={() => setDeleteDialogVisible(true)}>
              Delete Subscription
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        icon="pencil"
        style={[styles.fab, {backgroundColor: theme.colors.primary}]}
        onPress={handleEdit}
      />

      {/* Menu */}
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={{x: 0, y: 0}}
        style={styles.menu}>
        <Menu.Item
          leadingIcon="pencil"
          onPress={() => {
            setMenuVisible(false);
            handleEdit();
          }}
          title="Edit"
        />
        <Menu.Item
          leadingIcon={
            subscription.active
              ? 'close-circle-outline'
              : 'check-circle-outline'
          }
          onPress={() => {
            setMenuVisible(false);
            toggleActive();
          }}
          title={subscription.active ? 'Deactivate' : 'Activate'}
        />
        <Divider />
        <Menu.Item
          leadingIcon="delete"
          onPress={() => {
            setMenuVisible(false);
            setDeleteDialogVisible(true);
          }}
          title="Delete"
          titleStyle={{color: theme.colors.error}}
        />
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Delete Subscription</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Are you sure you want to delete "{subscription.name}"? This action
              cannot be undone.
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>
              Cancel
            </Button>
            <Button textColor={theme.colors.error} onPress={handleDelete}>
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  dangerCard: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  annualCostContainer: {
    alignItems: 'flex-end',
  },
  sectionTitle: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  divider: {
    marginVertical: 4,
  },
  notesContainer: {
    paddingVertical: 8,
  },
  notesText: {
    marginTop: 4,
  },
  deleteButton: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  menu: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
});

export default SubscriptionDetailScreen;
