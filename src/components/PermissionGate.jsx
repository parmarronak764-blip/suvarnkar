import { usePermissions } from '../hooks/usePermissions';

/**
 * Simple Permission Gate Component
 * Conditionally renders children based on permission checks
 */
export const PermissionGate = ({ 
  permission, 
  permissions, 
  module,
  requireAll = false,
  fallback = null,
  children 
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasModuleAccess } = usePermissions();

  let hasAccess = true;

  // Check single permission
  if (permission) {
    hasAccess = hasPermission(permission);
  }
  
  // Check multiple permissions
  else if (permissions) {
    hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }
  
  // Check module access
  else if (module) {
    hasAccess = hasModuleAccess(module);
  }

  return hasAccess ? children : fallback;
};

export default PermissionGate;