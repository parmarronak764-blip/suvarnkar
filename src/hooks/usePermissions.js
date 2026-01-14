import { useSelector } from 'react-redux';
import { 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions, 
  hasModuleAccess,
  getUserPermissions,
  filterByPermissions
} from '../utils/permissions';

/**
 * Simple permission hook for static permission system
 */
export const usePermissions = () => {
  // Get user role from Redux store
  const userRole = useSelector(state => state.user?.userData?.role?.name || 'user');

  return {
    // Core permission checks
    hasPermission: (permission) => hasPermission(userRole, permission),
    hasAnyPermission: (permissions) => hasAnyPermission(userRole, permissions),
    hasAllPermissions: (permissions) => hasAllPermissions(userRole, permissions),
    hasModuleAccess: (moduleName) => hasModuleAccess(userRole, moduleName),
    
    // Utility functions
    filterByPermissions: (items, permissionKey) => filterByPermissions(items, userRole, permissionKey),
    getUserPermissions: () => getUserPermissions(userRole),
    
    // User info
    userRole,
  };
};

export default usePermissions;