'use client';

import { useState, useEffect } from 'react';

import { paths } from 'src/routes/paths';
import { useRouter, usePathname } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';

import { SplashScreen } from 'src/components/loading-screen';

import { useAuthContext } from '../hooks';
import { useRoleCheck } from '../utils/permission-utils';
import { AuthGuard } from './auth-guard';
import { ModuleGuard } from './module-guard';
import { RoleBasedGuard } from './role-based-guard';

// ----------------------------------------------------------------------

interface RouteGuardProps {
  children: React.ReactNode;
  
  // Role-based protection
  requiredRoles?: string[];
  
  // Module-based protection
  requiredModule?: string;
  requiredModules?: string[];
  
  // Permission-based protection  
  requiredPermission?: string;
  requiredPermissions?: string[];
  
  // Combined requirements
  requireAll?: boolean;
  
  // Whether to skip authentication check (for public routes)
  skipAuth?: boolean;
  
  // Navigation options
  fallbackPath?: string;
  showPopup?: boolean;
}

/**
 * Comprehensive Route Guard
 * 
 * Combines authentication, role-based access, module access, and permission checks into a single guard.
 * This is the recommended guard for protecting routes that need both authentication
 * and specific access permissions.
 * 
 * @example
 * // Protect a route that requires authentication + owner role
 * <RouteGuard requiredRoles={['owner']}>
 *   <CompanySettingsPage />
 * </RouteGuard>
 * 
 * @example
 * // Protect a route that requires authentication + salesman module + create permission
 * <RouteGuard requiredModule="salesman" requiredPermission="create_salesman">
 *   <SalesmanAddPage />
 * </RouteGuard>
 * 
 * @example
 * // Protect a route with multiple permission options
 * <RouteGuard requiredPermissions={["create_salesman", "update_salesman"]}>
 *   <SalesmanFormPage />
 * </RouteGuard>
 */
export function RouteGuard({
  children,
  requiredRoles,
  requiredModule,
  requiredModules,
  requiredPermission,
  requiredPermissions,
  requireAll = false,
  skipAuth = false,
  fallbackPath = '/dashboard',
  showPopup = true,
}: RouteGuardProps) {
  const router = useRouter();
  const { hasAnyRole, userRole } = useRoleCheck();
  
  const [isChecking, setIsChecking] = useState(true);
  const [hasRoleAccess, setHasRoleAccess] = useState(true);
  const [hasRedirected, setHasRedirected] = useState(false);

  // Check role-based access
  useEffect(() => {
    if (requiredRoles && requiredRoles.length > 0) {
      const hasAccess = hasAnyRole(requiredRoles);
      setHasRoleAccess(hasAccess);
      
      if (!hasAccess && !hasRedirected) {
        if (!showPopup) {
          setHasRedirected(true);
          router.replace(fallbackPath);
        }
      }
    }
    setIsChecking(false);
  }, [requiredRoles, hasAnyRole, userRole, router, fallbackPath, showPopup, hasRedirected]);

  // If checking access, show loading
  if (isChecking) {
    return <SplashScreen />;
  }

  // If role check failed and popup is enabled, show access denied
  if (requiredRoles && requiredRoles.length > 0 && !hasRoleAccess && showPopup) {
    return (
      <RoleBasedGuard
        currentRole={userRole}
        allowedRoles={requiredRoles}
        hasContent={true}
      >
        {children}
      </RoleBasedGuard>
    );
  }

  // If role check failed and popup is disabled, don't render anything (will redirect)
  if (requiredRoles && requiredRoles.length > 0 && !hasRoleAccess && !showPopup) {
    return null;
  }

  // If authentication should be skipped, only check module/permission access
  if (skipAuth) {
    return (
      <ModuleGuard
        requiredModule={requiredModule}
        requiredModules={requiredModules}
        requiredPermission={requiredPermission}
        requiredPermissions={requiredPermissions}
        requireAll={requireAll}
        fallbackPath={fallbackPath}
        showPopup={showPopup}
      >
        {children}
      </ModuleGuard>
    );
  }

  // For authenticated routes, wrap with AuthGuard and ModuleGuard
  return (
    <AuthGuard>
      <ModuleGuard
        requiredModule={requiredModule}
        requiredModules={requiredModules}
        requiredPermission={requiredPermission}
        requiredPermissions={requiredPermissions}
        requireAll={requireAll}
        fallbackPath={fallbackPath}
        showPopup={showPopup}
      >
        {children}
      </ModuleGuard>
    </AuthGuard>
  );
} 