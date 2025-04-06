import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ThemeType} from '../../types';

interface SettingsState {
  theme: ThemeType;
  currency: string;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: SettingsState = {
  theme: 'system',
  currency: 'USD',
  status: 'idle',
  error: null,
};

// Async thunks
export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('settings');
      return jsonValue != null
        ? JSON.parse(jsonValue)
        : {theme: 'system', currency: 'USD'};
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }
  },
);

export const saveSettings = createAsyncThunk(
  'settings/saveSettings',
  async (settings: Pick<SettingsState, 'theme' | 'currency'>) => {
    try {
      await AsyncStorage.setItem('settings', JSON.stringify(settings));
      return settings;
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  },
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeType>) => {
      state.theme = action.payload;
      saveSettings({theme: state.theme, currency: state.currency});
    },
    setCurrency: (state, action: PayloadAction<string>) => {
      state.currency = action.payload;
      saveSettings({theme: state.theme, currency: state.currency});
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchSettings.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.theme = action.payload.theme || 'system';
        state.currency = action.payload.currency || 'USD';
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch settings';
      });
  },
});

export const {setTheme, setCurrency} = settingsSlice.actions;

export default settingsSlice.reducer;
