'use client';

import type { ReactNode } from 'react';

import { usePermissions } from '../hooks/use-permissions';

// ----------------------------------------------------------------------

interface PermissionGuardProps {
  children: ReactNode;
  
  // Module-based protection
  hasModule?: string;
  hasAnyModule?: string[];
  hasAllModules?: string[];
  
  // Permission-based protection
  hasPermission?: string;
  hasAnyPermission?: string[];
  hasAllPermissions?: string[];
  
  // Combined protection (module AND permission)
  requireAll?: boolean;
  
  // Fallback content when access is denied
  fallback?: ReactNode;
  
  // Whether to hide the element completely or show fallback
  hideOnNoAccess?: boolean;
}

/**
 * Permission Guard Component
 * 
 * Conditionally renders children based on module and/or permission checks.
 * 
 * @example
 * // Hide add button if user doesn't have create_salesman permission
 * <PermissionGuard hasPermission="create_salesman">
 *   <Button>Add Salesman</Button>
 * </PermissionGuard>
 * 
 * @example
 * // Show content only if user has salesman module AND create permission
 * <PermissionGuard hasModule="salesman" hasPermission="create_salesman" requireAll>
 *   <SalesmanForm />
 * </PermissionGuard>
 * 
 * @example
 * // Show fallback content when access is denied
 * <PermissionGuard 
 *   hasPermission="view_reports" 
 *   fallback={<div>You don't have permission to view reports</div>}
 * >
 *   <ReportsComponent />
 * </PermissionGuard>
 */
export function PermissionGuard({
  children,
  hasModule,
  hasAnyModule,
  hasAllModules,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  requireAll = false,
  fallback = null,
  hideOnNoAccess = true,
}: PermissionGuardProps) {
  const { can } = usePermissions();

  // Build the access check options
  const accessOptions = {
    module: hasModule,
    modules: hasAnyModule || hasAllModules,
    permission: hasPermission,
    permissions: hasAnyPermission || hasAllPermissions,
    requireAll: requireAll || !!hasAllModules || !!hasAllPermissions,
  };

  // Check if user has access
  const hasAccess = can(accessOptions);

  // If user has access, render children
  if (hasAccess) {
    return <>{children}</>;
  }

  // If user doesn't have access
  if (hideOnNoAccess) {
    // Return fallback or null
    return <>{fallback}</>;
  }

  // This case shouldn't happen with current logic, but keeping for future extensibility
  return null;
}

// ----------------------------------------------------------------------

/**
 * Convenience wrapper for permission-only checks
 */
interface PermissionOnlyGuardProps {
  children: ReactNode;
  permission: string;
  fallback?: ReactNode;
  hideOnNoAccess?: boolean;
}

export function PermissionOnly({
  children,
  permission,
  fallback = null,
  hideOnNoAccess = true,
}: PermissionOnlyGuardProps) {
  return (
    <PermissionGuard
      hasPermission={permission}
      fallback={fallback}
      hideOnNoAccess={hideOnNoAccess}
    >
      {children}
    </PermissionGuard>
  );
}

// ----------------------------------------------------------------------

/**
 * Convenience wrapper for module-only checks
 */
interface ModuleOnlyGuardProps {
  children: ReactNode;
  module: string;
  fallback?: ReactNode;
  hideOnNoAccess?: boolean;
}

export function ModuleOnly({
  children,
  module,
  fallback = null,
  hideOnNoAccess = true,
}: ModuleOnlyGuardProps) {
  return (
    <PermissionGuard
      hasModule={module}
      fallback={fallback}
      hideOnNoAccess={hideOnNoAccess}
    >
      {children}
    </PermissionGuard>
  );
} 