import { useSelector } from 'react-redux';
import type { RootState } from 'src/redux/store';

interface ModuleCheckOptions {
  module?: string;
  modules?: string[];
}

/**
 * Hook to check if user has access to specific modules
 */
export function useModuleCheck() {
  const { companies, selectedCompanyId } = useSelector((state: RootState) => state.auth);
  
  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);
  const userModules = selectedCompany?.modules || [];

  const hasModuleAccess = (module: string): boolean => {
    return userModules.includes(module);
  };

  const hasAnyModuleAccess = (modules: string[]): boolean => {
    return modules.some(module => userModules.includes(module));
  };

  const hasAllModuleAccess = (modules: string[]): boolean => {
    return modules.every(module => userModules.includes(module));
  };

  return {
    hasModuleAccess,
    hasAnyModuleAccess,
    hasAllModuleAccess,
    userModules,
    selectedCompany
  };
}

/**
 * Hook to check if user has specific permissions
 */
export function usePermissionCheck() {
  const { companies, selectedCompanyId } = useSelector((state: RootState) => state.auth);
  
  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);
  const userPermissions = selectedCompany?.permissions || [];

  const hasPermission = (permission: string): boolean => {
    return userPermissions.includes(permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => userPermissions.includes(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => userPermissions.includes(permission));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    userPermissions,
    selectedCompany
  };
}

/**
 * Hook to check user's role in the selected company
 */
export function useRoleCheck() {
  const { companies, selectedCompanyId } = useSelector((state: RootState) => state.auth);
  
  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);
  const userRole = selectedCompany?.role || '';

  const hasRole = (role: string): boolean => {
    return userRole === role;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.includes(userRole);
  };

  const isOwner = (): boolean => {
    return userRole === 'owner';
  };

  const isStaff = (): boolean => {
    return userRole === 'staff';
  };

  return {
    hasRole,
    hasAnyRole,
    isOwner,
    isStaff,
    userRole,
    selectedCompany
  };
}

/**
 * Combined hook for both module and permission checks
 */
export function useAccessCheck() {
  const moduleCheck = useModuleCheck();
  const permissionCheck = usePermissionCheck();

  const hasAccess = (options: {
    module?: string;
    modules?: string[];
    permission?: string;
    permissions?: string[];
    requireAll?: boolean;
  }): boolean => {
    const { module, modules, permission, permissions, requireAll = false } = options;

    // Check module access first
    let hasModuleAccess = true;
    if (module) {
      hasModuleAccess = moduleCheck.hasModuleAccess(module);
    } else if (modules && modules.length > 0) {
      hasModuleAccess = requireAll 
        ? moduleCheck.hasAllModuleAccess(modules)
        : moduleCheck.hasAnyModuleAccess(modules);
    }

    // Check permission access
    let hasPermissionAccess = true;
    if (permission) {
      hasPermissionAccess = permissionCheck.hasPermission(permission);
    } else if (permissions && permissions.length > 0) {
      hasPermissionAccess = requireAll
        ? permissionCheck.hasAllPermissions(permissions)
        : permissionCheck.hasAnyPermission(permissions);
    }

    return hasModuleAccess && hasPermissionAccess;
  };

  return {
    ...moduleCheck,
    ...permissionCheck,
    hasAccess
  };
}

/**
 * Utility function to check module access without hooks (for use in non-React contexts)
 */
export function checkModuleAccess(
  companies: any[],
  selectedCompanyId: number | null,
  options: ModuleCheckOptions
): boolean {
  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);
  const userModules = selectedCompany?.modules || [];

  const { module, modules } = options;

  // If specific module is required, check if user has access to it
  if (module && !userModules.includes(module)) {
    return false;
  }

  // If multiple modules are required, check if user has access to any of them
  if (modules && modules.length > 0) {
    return modules.some(mod => userModules.includes(mod));
  }

  // If only module is specified and user has access to it, return true
  if (module && userModules.includes(module)) {
    return true;
  }

  // If no specific requirements, return true (fallback)
  return true;
}

/**
 * Utility function to check permission access without hooks (for use in non-React contexts)
 */
export function checkPermissionAccess(
  companies: any[],
  selectedCompanyId: number | null,
  permission: string | string[]
): boolean {
  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);
  const userPermissions = selectedCompany?.permissions || [];

  if (Array.isArray(permission)) {
    return permission.some(perm => userPermissions.includes(perm));
  }

  return userPermissions.includes(permission);
}

/**
 * Combined access check utility for non-React contexts
 * Returns more detailed information about what failed
 */
export function checkAccess(
  companies: any[],
  selectedCompanyId: number | null,
  options: {
    module?: string;
    modules?: string[];
    permission?: string;
    permissions?: string[];
    requireAll?: boolean;
  }
): { hasAccess: boolean; failedModule?: boolean; failedPermission?: boolean } {
  const { module, modules, permission, permissions, requireAll = false } = options;

  let hasModuleAccess = true;
  let hasPermissionAccess = true;

  // Check module access
  if (module || modules) {
    hasModuleAccess = checkModuleAccess(companies, selectedCompanyId, { module, modules });
  }

  // Check permission access
  if (permission) {
    hasPermissionAccess = checkPermissionAccess(companies, selectedCompanyId, permission);
  } else if (permissions && permissions.length > 0) {
    hasPermissionAccess = checkPermissionAccess(companies, selectedCompanyId, permissions);
  }

  return {
    hasAccess: hasModuleAccess && hasPermissionAccess,
    failedModule: !hasModuleAccess,
    failedPermission: !hasPermissionAccess
  };
} 