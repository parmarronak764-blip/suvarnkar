import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import { combineReducers } from '@reduxjs/toolkit';
import userReducer from './slices/user.slice';
import accountReducer from './slices/account.slice';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user'], // Only persist the user slice
};

// Combine reducers
const rootReducer = combineReducers({
  user: userReducer,
  account: accountReducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store with persisted reducer
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          // Ignore external actions from browser extensions
          'oas3_clear_request_body_validate_error',
          'spec_log_request',
          'spec_set_request',
          'spec_set_mutated_request',
          'spec_set_response',
          'spec_validate_param',
          'spec_update_operation_meta_value',
          'show_popup',
          'authorize'
        ],
      },
    }),
  // Add devtools configuration to prevent external interference
  devTools: process.env.NODE_ENV !== 'production' ? {
    name: 'Suvarnakar ERP',
    actionSanitizer: (action) => {
      // Filter out external actions in devtools
      if (action.type.startsWith('oas3_') || action.type.startsWith('spec_')) {
        return { ...action, type: `[EXTERNAL] ${action.type}` };
      }
      return action;
    }
  } : false,
});

// Create persistor
export const persistor = persistStore(store);

export default store;
