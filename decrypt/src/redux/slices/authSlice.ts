// store/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState } from '../../auth/types';

// Storage key for persisting selected company
const SELECTED_COMPANY_STORAGE_KEY = 'selectedCompanyId';

// Helper functions for localStorage operations
const saveSelectedCompanyId = (companyId: number | null) => {
  try {
    if (companyId !== null) {
      localStorage.setItem(SELECTED_COMPANY_STORAGE_KEY, companyId.toString());
    } else {
      localStorage.removeItem(SELECTED_COMPANY_STORAGE_KEY);
    }
  } catch (error) {
    console.warn('Failed to save selected company ID to localStorage:', error);
  }
};

const loadSelectedCompanyId = (): number | null => {
  try {
    const saved = localStorage.getItem(SELECTED_COMPANY_STORAGE_KEY);
    return saved ? parseInt(saved, 10) : null;
  } catch (error) {
    console.warn('Failed to load selected company ID from localStorage:', error);
    return null;
  }
};

const initialState: AuthState = {
  user: null,
  companies: [],
  selectedCompanyId: null,
  loading: true
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthState(state, action: PayloadAction<Partial<AuthState>>) {
      Object.assign(state, action.payload);
      
      // If companies are being set, check for persisted selection or default to first company
      if (action.payload.companies && action.payload.companies.length > 0) {
        const persistedCompanyId = loadSelectedCompanyId();
        const validCompanyIds = action.payload.companies.map(c => c.id);
        
        if (persistedCompanyId && validCompanyIds.includes(persistedCompanyId)) {
          // Use persisted selection if it's valid
          state.selectedCompanyId = persistedCompanyId;
        } else if (!state.selectedCompanyId) {
          // Default to first company if no valid persisted selection and no current selection
          state.selectedCompanyId = action.payload.companies[0].id;
          saveSelectedCompanyId(state.selectedCompanyId);
        }
      }
    },
    logout(state) {
      state.user = null;
      state.companies = [];
      state.selectedCompanyId = null;
      state.loading = false;
      // Clear persisted company selection on logout
      saveSelectedCompanyId(null);
    },
    selectCompany(state, action: PayloadAction<number>) {
      state.selectedCompanyId = action.payload;
      // Persist the selection to localStorage
      saveSelectedCompanyId(action.payload);
    },
    updateCompany(state, action: PayloadAction<{ id: number; updates: Partial<{ name: string; logo: string; plan: string; permissions: string[]; modules: string[]; role: string }> }>) {
      const { id, updates } = action.payload;
      const companyIndex = state.companies.findIndex(company => company.id === id);
      if (companyIndex !== -1) {
        state.companies[companyIndex] = { ...state.companies[companyIndex], ...updates };
      }
    }
  }
});

export const { setAuthState, logout, selectCompany, updateCompany } = authSlice.actions;
export default authSlice.reducer;
