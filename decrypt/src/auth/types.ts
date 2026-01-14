export type UserType = Record<string, any> | null;


export type CompanyContext = {
  id: number;
  name: string;
  logo?: string;  // Optional logo URL
  plan?: string;  // Optional plan name (e.g., 'Free', 'Premium')
  permissions: string[];
  modules: string[];
  role: string; // User's role in this company
};

export type AuthState = {
  user: UserType;
  companies: CompanyContext[];
  selectedCompanyId: number | null;
  loading: boolean;
};

export type AuthContextValue = {
  user: UserType;
  loading: boolean;
  authenticated: boolean;
  unauthenticated: boolean;
  checkUserSession?: () => Promise<void>;
};
