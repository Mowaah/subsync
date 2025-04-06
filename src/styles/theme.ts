import {
  MD3DarkTheme,
  MD3LightTheme,
  adaptNavigationTheme,
} from 'react-native-paper';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import {ColorSchemeName} from 'react-native';

// Merge React Navigation and React Native Paper themes
const {LightTheme, DarkTheme} = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

// Define custom fonts compatible with React Navigation
const navigationFonts = {
  regular: {
    fontFamily: 'sans-serif',
    fontWeight: 'normal' as 'normal',
  },
  medium: {
    fontFamily: 'sans-serif-medium',
    fontWeight: 'normal' as 'normal',
  },
  bold: {
    fontFamily: 'sans-serif',
    fontWeight: 'bold' as 'bold',
  },
  heavy: {
    fontFamily: 'sans-serif',
    fontWeight: '900' as '900',
  },
};

// Custom colors for light theme
const lightThemeExtended = {
  ...MD3LightTheme,
  ...LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...LightTheme.colors,
    primary: '#3f51b5',
    accent: '#7986cb',
    background: '#f5f5f5',
    card: '#ffffff',
    text: '#212121',
    border: '#e0e0e0',
    notification: '#f44336',
    placeholder: '#9e9e9e',
    secondaryContainer: '#e8eaf6',
  },
  // Add custom fonts structure to satisfy both themes
  fonts: {
    ...MD3LightTheme.fonts,
    ...navigationFonts,
  },
};

// Custom colors for dark theme
const darkThemeExtended = {
  ...MD3DarkTheme,
  ...DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...DarkTheme.colors,
    primary: '#7986cb',
    accent: '#3f51b5',
    background: '#121212',
    card: '#1e1e1e',
    text: '#ffffff',
    border: '#333333',
    notification: '#f44336',
    placeholder: '#9e9e9e',
    secondaryContainer: '#303f9f',
  },
  // Add custom fonts structure to satisfy both themes
  fonts: {
    ...MD3DarkTheme.fonts,
    ...navigationFonts,
  },
};

// Function to get the current theme based on the color scheme
export const getTheme = (colorScheme: ColorSchemeName) => {
  return colorScheme === 'dark' ? darkThemeExtended : lightThemeExtended;
};

export {lightThemeExtended, darkThemeExtended};
