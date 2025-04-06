/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect} from 'react';
import {StatusBar, LogBox} from 'react-native';
import {Provider as StoreProvider} from 'react-redux';
import {PaperProvider} from 'react-native-paper';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import store from './src/store';
import {useColorScheme} from 'react-native';
import {getTheme} from './src/styles/theme';
import {migrateData} from './src/utils/migrationUtils';

// Ignore specific LogBox warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

function App(): React.JSX.Element {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);

  // Run data migration on app startup
  useEffect(() => {
    migrateData().catch(error => {
      console.error('Failed to migrate data:', error);
    });
  }, []);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <StoreProvider store={store}>
        <PaperProvider theme={theme}>
          <StatusBar
            barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
            backgroundColor={theme.colors.background}
          />
          <AppNavigator />
        </PaperProvider>
      </StoreProvider>
    </GestureHandlerRootView>
  );
}

export default App;
