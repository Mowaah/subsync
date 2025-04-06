import {configureStore} from '@reduxjs/toolkit';
import subscriptionReducer from './slices/subscriptionSlice';
import settingsReducer from './slices/settingsSlice';

const store = configureStore({
  reducer: {
    subscriptions: subscriptionReducer,
    settings: settingsReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable for redux-persist integration
    }),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export default store;
