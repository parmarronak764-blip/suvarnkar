# 🔐 Advanced Permission Management System

A comprehensive, Redux-based permission management system for multi-company applications with **API + Static Config** integration and static override capabilities.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

This advanced permission system provides:

- **Hybrid Permission System** - Combines `/me` API permissions with static JSON configuration
- **Priority-based Merging** - API permissions take priority, static config fills gaps
- **Company-based permissions** - Different permissions per company
- **Role-based Fallback** - Static role definitions when API is limited
- **Static overrides** - Override any permissions for development/testing
- **Automatic refresh** - Fetches permissions on dashboard load and page refresh
- **Permission Source Tracking** - Know if permission comes from API, static config, or override
- **Redux integration** - Centralized state management
- **Performance optimized** - Memoized permission checks
- **Debug Tools** - Built-in permission debugging and testing components

## 🏗️ Architecture

### Core Components

```
src/
├── config/
│   └── permissions.json             # Static permission configuration
├── utils/
│   └── permissionConfig.js          # Permission config utilities
├── redux/
│   ├── slices/
│   │   └── permission.slice.js     # Redux slice for permission state
│   └── store.js                     # Updated store configuration
├── hooks/
│   ├── usePermission.jsx            # Main permission hook
│   └── usePermissionApi.jsx         # API operations hook
├── components/
│   ├── PermissionGate.jsx           # Conditional rendering component
│   ├── PermissionProvider.jsx       # Provider component
│   ├── PermissionDebugger.jsx       # Debug component
│   └── PermissionStatus.jsx         # Status display component
└── app.jsx                          # Updated with PermissionProvider
```

### Data Flow

```mermaid
graph TD
    A[User Login] --> B[PermissionProvider]
    B --> C[usePermissionApi.fetchPermissions]
    C --> D[/me API Call]
    D --> E[Redux Store Update]
    E --> F[Static Config Merge]
    F --> G[Company Selection]
    G --> H[Permission Filtering]
    H --> I[Component Rendering]
    
    J[Static Config JSON] --> F
    K[Static Overrides] --> E
    L[Company Switch] --> G
    M[Role-based Permissions] --> F
```

## 🚀 Installation

### 1. Redux Store Update

The permission slice is already added to your Redux store:

```javascript
// src/redux/store.js
import permissionReducer from './slices/permission.slice';

const rootReducer = combineReducers({
  user: userReducer,
  permission: permissionReducer, // ✅ Added
});
```

### 2. App Integration

The PermissionProvider is already integrated in your app:

```javascript
// src/app.jsx
<AuthProvider>
  <PermissionProvider> {/* ✅ Added */}
    <SettingsProvider>
      {/* ... rest of your app */}
    </SettingsProvider>
  </PermissionProvider>
</AuthProvider>
```

### 3. Static Configuration

The static permission configuration is already set up:

```javascript
// src/config/permissions.json
{
  "version": "1.0.0",
  "permissions": {
    "salesman": {
      "module": "salesman",
      "permissions": ["view_salesman", "add_salesman", ...],
      "default_permissions": ["view_salesman"]
    }
  },
  "role_permissions": {
    "owner": { "permissions": [...], "modules": [...] },
    "manager": { "permissions": [...], "modules": [...] }
  }
}
```

### 4. API Route

The `/me` endpoint is already configured:

```javascript
// src/utils/apiRoute.js
ACCOUNTS: {
  ME: 'accounts/me/', // ✅ Already configured
}
```

## 📖 Usage

### Basic Permission Checking

```javascript
import { usePermission } from 'src/hooks/usePermission';

const MyComponent = () => {
  const { hasPermission, hasModuleAccess } = usePermission();

  return (
    <div>
      {hasPermission('view_salesman') && (
        <UserList />
      )}
      
      {hasModuleAccess('salesman') && (
        <SalesmanDashboard />
      )}
    </div>
  );
};
```

### PermissionGate Component

```javascript
import { PermissionGate } from 'src/components/PermissionGate';

const UserManagement = () => {
  return (
    <div>
      {/* Single permission check */}
      <PermissionGate permission="view_salesman">
        <UserList />
      </PermissionGate>

      {/* Multiple permissions (OR logic) */}
      <PermissionGate 
        permissions={['add_salesman', 'update_salesman']}
        requireAll={false}
      >
        <UserActions />
      </PermissionGate>

      {/* Multiple permissions (AND logic) */}
      <PermissionGate 
        permissions={['update_salesman', 'delete_salesman']}
        requireAll={true}
      >
        <AdvancedUserActions />
      </PermissionGate>

      {/* Module access check */}
      <PermissionGate module="salesman">
        <SalesmanTools />
      </PermissionGate>

      {/* Custom fallback */}
      <PermissionGate 
        permission="admin_access"
        fallback={<div>Access denied</div>}
      >
        <AdminPanel />
      </PermissionGate>
    </div>
  );
};
```

### Higher-Order Component

```javascript
import { withPermission } from 'src/components/PermissionGate';

const AdminPanel = () => <div>Admin Content</div>;

// Wrap component with permission check
const ProtectedAdminPanel = withPermission(AdminPanel, {
  permission: 'admin_access',
  fallback: <div>Access Denied</div>
});
```

### Company Management

```javascript
import { usePermission } from 'src/hooks/usePermission';

const CompanySwitcher = () => {
  const { 
    getAvailableCompanies, 
    switchCompany, 
    currentCompany,
    getCurrentCompanyInfo 
  } = usePermission();

  const companies = getAvailableCompanies();
  const currentCompanyInfo = getCurrentCompanyInfo();

  return (
    <div>
      <h3>Current Company: {currentCompanyInfo?.company.name}</h3>
      
      <select 
        value={currentCompany} 
        onChange={(e) => switchCompany(Number(e.target.value))}
      >
        {companies.map(company => (
          <option key={company.id} value={company.id}>
            {company.name}
          </option>
        ))}
      </select>
    </div>
  );
};
```

### Permission Source Tracking

```javascript
import { usePermission } from 'src/hooks/usePermission';

const PermissionInfo = () => {
  const { 
    getPermissionSource,
    permissionSource,
    apiPermissions,
    currentPermissions
  } = usePermission();

  return (
    <div>
      <h3>Permission Sources</h3>
      <p>API Permissions: {permissionSource.api.length}</p>
      <p>Static Permissions: {permissionSource.static.length}</p>
      <p>Override Permissions: {permissionSource.override.length}</p>
      
      <h4>Permission Sources:</h4>
      {currentPermissions.map(permission => (
        <div key={permission}>
          {permission}: {getPermissionSource(permission)}
        </div>
      ))}
    </div>
  );
};
```

### Static Permission Overrides

```javascript
import { usePermission } from 'src/hooks/usePermission';

const DevTools = () => {
  const { 
    overridePermissions, 
    clearOverrides, 
    isPermissionOverridden 
  } = usePermission();

  const enableAdminMode = () => {
    overridePermissions({
      'admin_access': true,
      'delete_salesman': true,
      'view_all_data': true,
    });
  };

  const disableAdminMode = () => {
    clearOverrides();
  };

  return (
    <div>
      <button onClick={enableAdminMode}>
        Enable Admin Mode (Dev)
      </button>
      
      <button onClick={disableAdminMode}>
        Clear Overrides
      </button>
      
      {isPermissionOverridden('admin_access') && (
        <div>⚠️ Admin mode active</div>
      )}
    </div>
  );
};
```

### Debug Components

```javascript
import { PermissionDebugger, PermissionStatus } from 'src/components';

const DevPage = () => {
  return (
    <div>
      <h1>Permission Debug Tools</h1>
      
      {/* Compact status display */}
      <PermissionStatus />
      
      {/* Full debug interface */}
      <PermissionDebugger />
    </div>
  );
};
```

## 📚 API Reference

### usePermission Hook

```javascript
const {
  // Permission checking
  hasPermission,           // (permission: string) => boolean
  hasAllPermissions,      // (permissions: string[]) => boolean
  hasAnyPermission,       // (permissions: string[]) => boolean
  hasModuleAccess,        // (module: string) => boolean
  
  // Company management
  getCurrentCompanyInfo,  // () => CompanyUser | null
  getAvailableCompanies,  // () => Company[]
  switchCompany,          // (companyId: number) => void
  
  // Static overrides
  overridePermissions,    // (overrides: Record<string, boolean>) => void
  clearOverrides,         // () => void
  isPermissionOverridden, // (permission: string) => boolean
  getEffectivePermissions, // () => string[]
  
  // Permission source tracking
  getPermissionSource,    // (permission: string) => 'api' | 'static' | 'override' | 'none'
  permissionSource,       // { api: string[], static: string[], override: string[] }
  
  // Static config utilities
  getAllAvailablePermissions, // () => string[]
  getAllAvailableModules,     // () => string[]
  isPermissionDefinedInConfig, // (permission: string) => boolean
  getPermissionModuleFromConfig, // (permission: string) => string | null
  getModulePermissionsFromConfig, // (module: string) => string[]
  validateConfig,         // () => { isValid: boolean, errors: string[] }
  getStats,              // () => { totalPermissions: number, totalModules: number, ... }
  
  // State
  currentPermissions,     // string[] (merged from API + static)
  currentModules,         // string[] (merged from API + static)
  apiPermissions,         // string[] (raw from API)
  apiModules,            // string[] (raw from API)
  currentCompany,         // number | null
  userData,              // UserData | null
  loading,               // boolean
  error,                 // string | null
  staticOverrides,       // Record<string, boolean>
  configVersion,         // string | null
} = usePermission();
```

### usePermissionApi Hook

```javascript
const {
  fetchPermissions,        // (forceRefresh?: boolean) => Promise<UserData>
  refreshPermissions,      // () => Promise<UserData>
  markPermissionsStale,    // () => void
  arePermissionsStale,     // () => boolean
  getCompanyPermissions,   // (companyId: number) => {permissions: string[], modules: string[]}
  hasCompanyAccess,        // (companyId: number) => boolean
  loading,                 // boolean
  error,                   // string | null
  userData,               // UserData | null
} = usePermissionApi();
```

### PermissionGate Props

```javascript
<PermissionGate
  permission="string"           // Single permission to check
  permissions={["string"]}     // Multiple permissions to check
  requireAll={boolean}         // AND vs OR logic (default: false)
  module="string"              // Module access check
  invert={boolean}             // Invert permission check (default: false)
  fallback={ReactNode}         // Content to show if permission fails
>
  {ReactNode}                   // Content to show if permission passes
</PermissionGate>
```

## 💡 Examples

### Navigation Menu Filtering

```javascript
// src/layouts/nav-config-dashboard.jsx
import { usePermission } from 'src/hooks/usePermission';

const getFilteredNavConfig = (navConfig) => {
  const { hasPermission, hasModuleAccess } = usePermission();
  
  return navConfig.map(item => {
    if (item.children) {
      const filteredChildren = item.children.filter(child => {
        // Check module access
        if (child.module && !hasModuleAccess(child.module)) {
          return false;
        }
        
        // Check permission
        if (child.permission && !hasPermission(child.permission)) {
          return false;
        }
        
        return true;
      });
      
      return { ...item, children: filteredChildren };
    }
    
    return item;
  });
};
```

### Button Permissions

```javascript
const UserActions = ({ user }) => {
  const { hasPermission } = usePermission();

  return (
    <div>
      <PermissionGate permission="view_salesman">
        <Button>View Details</Button>
      </PermissionGate>
      
      <PermissionGate permission="update_salesman">
        <Button>Edit User</Button>
      </PermissionGate>
      
      <PermissionGate permission="delete_salesman">
        <Button color="error">Delete User</Button>
      </PermissionGate>
    </div>
  );
};
```

### Form Field Permissions

```javascript
const UserForm = () => {
  const { hasPermission } = usePermission();

  return (
    <form>
      <TextField name="name" label="Name" />
      <TextField name="email" label="Email" />
      
      <PermissionGate permission="manage_roles">
        <TextField name="role" label="Role" />
      </PermissionGate>
      
      <PermissionGate permission="manage_permissions">
        <MultiSelect name="permissions" label="Permissions" />
      </PermissionGate>
    </form>
  );
};
```

### Conditional Rendering

```javascript
const Dashboard = () => {
  const { hasModuleAccess, getCurrentCompanyInfo } = usePermission();
  const companyInfo = getCurrentCompanyInfo();

  return (
    <div>
      <h1>Dashboard</h1>
      
      {hasModuleAccess('salesman') && (
        <SalesmanWidget />
      )}
      
      {hasModuleAccess('products') && (
        <ProductWidget />
      )}
      
      {companyInfo?.role?.name === 'owner' && (
        <OwnerPanel />
      )}
    </div>
  );
};
```

## 🎯 Best Practices

### 1. Permission Naming Convention

```javascript
// Use descriptive, hierarchical naming
const PERMISSIONS = {
  // User management
  'view_salesman',
  'add_salesman', 
  'update_salesman',
  'delete_salesman',
  
  // Product management
  'view_products',
  'add_products',
  'update_products',
  'delete_products',
  
  // Admin functions
  'admin_access',
  'manage_roles',
  'view_all_data',
};
```

### 2. Module Organization

```javascript
// Group related permissions by module
const MODULES = {
  SALESMAN: 'salesman',
  PRODUCTS: 'products', 
  REPORTS: 'reports',
  ADMIN: 'admin',
};
```

### 3. Error Handling

```javascript
const MyComponent = () => {
  const { loading, error } = usePermission();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return <MainContent />;
};
```

### 4. Performance Optimization

```javascript
// Use useMemo for expensive permission calculations
const ExpensiveComponent = () => {
  const { hasPermission } = usePermission();
  
  const expensiveData = useMemo(() => {
    return hasPermission('view_all_data') 
      ? calculateExpensiveData() 
      : calculateLimitedData();
  }, [hasPermission]);

  return <div>{expensiveData}</div>;
};
```

### 5. Testing

```javascript
// Mock permissions for testing
const TestComponent = () => {
  const { overridePermissions } = usePermission();
  
  useEffect(() => {
    // Enable all permissions for testing
    overridePermissions({
      'view_salesman': true,
      'add_salesman': true,
      'update_salesman': true,
      'delete_salesman': true,
    });
  }, [overridePermissions]);

  return <MyComponent />;
};
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Permissions Not Loading

```javascript
// Check if PermissionProvider is properly wrapped
// Ensure /me API is returning correct data structure
// Check Redux DevTools for permission state
```

#### 2. Company Switching Issues

```javascript
// Ensure selectedCompany is properly set in user slice
// Check if company ID matches the API response
// Verify company_users array structure
```

#### 3. Static Overrides Not Working

```javascript
// Ensure overrides are set before permission checks
// Check Redux state for staticOverrides
// Verify override keys match permission names exactly
```

#### 4. Performance Issues

```javascript
// Use useMemo for expensive permission calculations
// Avoid permission checks in render loops
// Consider using usePermissionCheck hook for simple boolean checks
```

### Debug Tools

```javascript
// Add to your component for debugging
const DebugPermissions = () => {
  const permissionState = useSelector(state => state.permission);
  
  return (
    <pre>
      {JSON.stringify(permissionState, null, 2)}
    </pre>
  );
};
```

## 📝 API Response Format

The system expects the `/me` API to return:

```json
{
  "success": true,
  "message": "",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "User Name",
    "phone": "+1234567890",
    "is_active": true,
    "company_users": [
      {
        "company": {
          "id": 1,
          "name": "Company Name",
          "city": "City",
          "is_franchise": false,
          "logo": "http://example.com/logo.png",
          "tag_prefix": "PREFIX"
        },
        "role": {
          "id": 1,
          "name": "owner"
        },
        "joining_date": "2025-01-01",
        "is_active": true,
        "profile_image": null,
        "id_card": null,
        "modules": ["salesman", "products"],
        "permissions": [
          "add_salesman",
          "update_salesman", 
          "delete_salesman",
          "view_salesman"
        ]
      }
    ]
  }
}
```

## 🚀 Future Enhancements

- **Role-based permissions** - Automatic permission inheritance from roles
- **Time-based permissions** - Temporary permission grants
- **Audit logging** - Track permission usage and changes
- **Permission caching** - Advanced caching strategies
- **GraphQL integration** - Permission-aware GraphQL queries

---

## 📞 Support

For questions or issues with the permission system, please:

1. Check the troubleshooting section
2. Review the Redux DevTools for state inspection
3. Verify API response format matches expected structure
4. Test with static overrides to isolate API vs. frontend issues

The permission system is designed to be robust and fail gracefully - if permissions fail to load, the app will continue to function with limited access rather than breaking completely.
