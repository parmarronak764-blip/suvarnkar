'use client'; // Mark as client component if it uses hooks

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import type { WorkspacesPopoverProps } from './components/workspaces-popover';
import type { RootState } from 'src/redux/store';

// ----------------------------------------------------------------------

// Define the type for a single workspace item
interface WorkspaceItem {
  id: string;
  name: string;
  plan: string;
  logo: string;
}

/**
 * Custom hook to get workspaces data from Redux store.
 * @returns An object containing the workspaces data, loading state, and error state.
 */
export function useWorkspaces() {
  const { companies, loading } = useSelector((state: RootState) => state.auth);
  
  // Transform companies data to match the expected workspace format
  const workspaces: WorkspacesPopoverProps['data'] = companies.map((company) => ({
    id: String(company.id),
    name: company.name,
    plan: company.plan || 'Free',
    logo: company.logo || '',
  }));

  return { 
    workspaces, 
    loading, 
    error: null,
    refresh: () => {} // No-op since we're using Redux data
  };
}

// You no longer need to export _workspaces directly as it's now fetched via the hook
// export const _workspaces: WorkspacesPopoverProps['data'] = [ ... ];
