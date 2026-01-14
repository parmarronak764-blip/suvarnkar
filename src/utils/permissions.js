import permissionsConfig from '../config/permissions.json';

/**
 * Optimized Permission Utility
 * Minimal code for maximum functionality
 */

// Cache for better performance
let allPermissionsCache = null;
let rolePermissionsCache = {};

/**
 * Get all available permissions
 */
export const getAllPermissions = () => {
  if (!allPermissionsCache) {
    allPermissionsCache = Object.values(permissionsConfig.modules)
      .flatMap(module => module.permissions);
  }
  return allPermissionsCache;
};

/**
 * Get permissions for a specific role
 */
export const getRolePermissions = (role) => {
  if (!rolePermissionsCache[role]) {
    const roleConfig = permissionsConfig.roles[role];
    rolePermissionsCache[role] = roleConfig ? roleConfig.permissions : [];
  }
  return rolePermissionsCache[role];
};

/**
 * Check if user has permission
 */
export const hasPermission = (userRole, permission) => {
  const rolePermissions = getRolePermissions(userRole);
  return rolePermissions.includes(permission);
};

/**
 * Check if user has any of the permissions
 */
export const hasAnyPermission = (userRole, permissions) => {
  const rolePermissions = getRolePermissions(userRole);
  return permissions.some(permission => rolePermissions.includes(permission));
};

/**
 * Check if user has all permissions
 */
export const hasAllPermissions = (userRole, permissions) => {
  const rolePermissions = getRolePermissions(userRole);
  return permissions.every(permission => rolePermissions.includes(permission));
};

/**
 * Get module permissions
 */
export const getModulePermissions = (moduleName) => {
  const module = permissionsConfig.modules[moduleName];
  return module ? module.permissions : [];
};

/**
 * Check if user has module access
 */
export const hasModuleAccess = (userRole, moduleName) => {
  const modulePermissions = getModulePermissions(moduleName);
  return hasAnyPermission(userRole, modulePermissions);
};

/**
 * Filter items based on permissions
 */
export const filterByPermissions = (items, userRole, permissionKey = 'permission') =>
  items.filter(item => {
    const requiredPermission = item[permissionKey];
    return !requiredPermission || hasPermission(userRole, requiredPermission);
  })

/**
 * Get user's effective permissions
 */
export const getUserPermissions = (userRole) => getRolePermissions(userRole)

export default {
  getAllPermissions,
  getRolePermissions,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getModulePermissions,
  hasModuleAccess,
  filterByPermissions,
  getUserPermissions
};
