import { useAccessCheck } from '../utils/permission-utils';

/**
 * Hook to check module access and permissions
 * This is a convenience hook that provides easy access to both module and permission checking
 */
export function usePermissions() {
  const {
    hasModuleAccess,
    hasAnyModuleAccess,
    hasAllModuleAccess,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasAccess,
    userModules,
    userPermissions,
    selectedCompany
  } = useAccessCheck();

  return {
    // Module checking methods
    hasModuleAccess,
    hasAnyModuleAccess,
    hasAllModuleAccess,
    
    // Permission checking methods
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Combined access check
    hasAccess,
    
    // Current user's modules and permissions
    userModules,
    userPermissions,
    selectedCompany,
    
    // Convenience methods for common checks
    canView: (module: string) => {
      return hasModuleAccess(module);
    },
    
    canAccess: (module: string) => {
      return hasModuleAccess(module);
    },
    
    canAccessAny: (modules: string[]) => {
      return hasAnyModuleAccess(modules);
    },
    
    canAccessAll: (modules: string[]) => {
      return hasAllModuleAccess(modules);
    },

    // Permission convenience methods
    canPerform: (permission: string) => {
      return hasPermission(permission);
    },

    canPerformAny: (permissions: string[]) => {
      return hasAnyPermission(permissions);
    },

    canPerformAll: (permissions: string[]) => {
      return hasAllPermissions(permissions);
    },

    // Combined convenience method
    can: (options: {
      module?: string;
      modules?: string[];
      permission?: string;
      permissions?: string[];
      requireAll?: boolean;
    }) => {
      return hasAccess(options);
    }
  };
} 