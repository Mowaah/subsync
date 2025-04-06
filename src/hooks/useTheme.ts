import {useColorScheme} from 'react-native';
import {useAppSelector} from './useRedux';
import {getTheme} from '../styles/theme';

export const useAppTheme = () => {
  const systemColorScheme = useColorScheme();
  const themePreference = useAppSelector(state => state.settings.theme);

  // Determine the active theme based on user preference and system settings
  const activeTheme: 'dark' | 'light' =
    themePreference === 'system'
      ? systemColorScheme === 'dark'
        ? 'dark'
        : 'light'
      : themePreference;

  return {
    theme: getTheme(activeTheme),
    activeTheme,
    isDarkMode: activeTheme === 'dark',
  };
};
