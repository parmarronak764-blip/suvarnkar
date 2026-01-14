'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import AlertTitle from '@mui/material/AlertTitle';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';

import { useRouter, usePathname } from 'src/routes/hooks';

import type { RootState } from 'src/redux/store';

import { checkAccess } from '../utils/permission-utils';

// ----------------------------------------------------------------------

export interface ModuleGuardProps {
  children: React.ReactNode;
  
  // Module-based protection
  requiredModule?: string;
  requiredModules?: string[];
  
  // Permission-based protection  
  requiredPermission?: string;
  requiredPermissions?: string[];
  
  // Combined requirements
  requireAll?: boolean;
  
  // Navigation and UI options
  fallbackPath?: string;
  showPopup?: boolean;
}

// Route to module mapping with pattern matching
const ROUTE_MODULE_MAP: Array<{ pattern: string | RegExp; module: string }> = [
  // More specific patterns first
  { pattern: /^\/masters\/salesman/, module: 'salesman' },
  { pattern: /^\/dashboard\/group\/five/, module: 'five' },
  { pattern: /^\/dashboard\/group\/six/, module: 'six' },
  // { pattern: '/dashboard', module: 'dashboard' }, // Commented out to avoid broad matching
//   { pattern: /^\/sales/, module: 'sales' },
//   { pattern: /^\/sales\/orders/, module: 'orders' },
//   { pattern: /^\/sales\/invoices/, module: 'invoices' },
//   { pattern: /^\/reports/, module: 'reports' },
//   { pattern: /^\/reports\/sales/, module: 'sales_reports' },
//   { pattern: /^\/reports\/financial/, module: 'financial_reports' },
];

// Route to permission mapping for automatic permission detection
const ROUTE_PERMISSION_MAP: Array<{ pattern: string | RegExp; permission: string }> = [
  // Salesman permissions
  { pattern: /^\/masters\/salesman\/add/, permission: 'add_salesman' },
  { pattern: /^\/masters\/salesman\/edit/, permission: 'update_salesman' },
  
  // Add more route-permission mappings as needed
  // { pattern: /^\/sales\/orders\/add/, permission: 'create_order' },
  // { pattern: /^\/sales\/orders\/edit/, permission: 'update_order' },
  // { pattern: /^\/reports\/sales/, permission: 'view_sales_reports' },
];

export function ModuleGuard({ 
  children, 
  requiredModule, 
  requiredModules, 
  requiredPermission,
  requiredPermissions,
  requireAll = false,
  fallbackPath = '/dashboard',
  showPopup = true 
}: ModuleGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { companies, selectedCompanyId } = useSelector((state: RootState) => state.auth);
  
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [denialReason, setDenialReason] = useState<string>('');

  // Determine required module from route if not explicitly provided
  const getRequiredModule = () => {
    if (requiredModule) return requiredModule;
    if (requiredModules) return requiredModules;
    
    // Try to match route to module using pattern matching
    // Start with most specific patterns first
    const sortedPatterns = [...ROUTE_MODULE_MAP].sort((a, b) => {
      // Prioritize more specific patterns (longer regex patterns)
      const aSpecificity = typeof a.pattern === 'string' ? a.pattern.length : a.pattern.source.length;
      const bSpecificity = typeof b.pattern === 'string' ? b.pattern.length : b.pattern.source.length;
      return bSpecificity - aSpecificity;
    });

    for (const { pattern, module } of sortedPatterns) {
      if (typeof pattern === 'string') {
        if (pathname === pattern) {
          return module;
        }
      } else {
        if (pattern.test(pathname)) {
          return module;
        }
      }
    }
    
    return null;
  };

  // Determine required permission from route if not explicitly provided
  const getRequiredPermission = () => {
    if (requiredPermission) return requiredPermission;
    if (requiredPermissions) return requiredPermissions;
    
    // Try to match route to permission using pattern matching
    for (const { pattern, permission } of ROUTE_PERMISSION_MAP) {
      if (typeof pattern === 'string') {
        if (pathname === pattern) {
          return permission;
        }
      } else {
        if (pattern.test(pathname)) {
          return permission;
        }
      }
    }
    
    return null;
  };

  const checkUserAccess = () => {
    const module = getRequiredModule();
    const permission = getRequiredPermission();
    
    // If no requirements, allow access
    if (!module && !permission) {
      setHasAccess(true);
      setIsChecking(false);
      return;
    }

    // Build access check options
    const accessOptions = {
      module: typeof module === 'string' ? module : undefined,
      modules: Array.isArray(module) ? module : undefined,
      permission: typeof permission === 'string' ? permission : undefined,
      permissions: Array.isArray(permission) ? permission : undefined,
      requireAll
    };

    const accessResult = checkAccess(companies, selectedCompanyId, accessOptions);

    if (!accessResult.hasAccess) {
      setHasAccess(false);
      
      // Determine denial reason for better user feedback
      let reason = 'You don\'t have the required access to view this page.';
      
      if (accessResult.failedModule && accessResult.failedPermission) {
        // Both module and permission failed
        reason = 'You don\'t have the required module access and permission to view this page.';
      } else if (accessResult.failedModule) {
        // Only module failed
        reason = 'You don\'t have access to the required module for this page.';
      } else if (accessResult.failedPermission) {
        // Only permission failed
        reason = 'You don\'t have the required permission to access this page.';
      }
      
      setDenialReason(reason);
      
      if (showPopup) {
        setShowAccessDenied(true);
      } else {
        router.replace(fallbackPath);
      }
    } else {
      setHasAccess(true);
    }
    
    setIsChecking(false);
  };

  useEffect(() => {
    checkUserAccess();
  }, [pathname, companies, selectedCompanyId]);

  const handleClosePopup = () => {
    setShowAccessDenied(false);
    router.replace(fallbackPath);
  };

  // Don't render anything while checking access
  if (isChecking) {
    return null;
  }

  // Don't render children if access is denied
  if (!hasAccess) {
    return (
      <Dialog
        open={showAccessDenied}
        onClose={handleClosePopup}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1, color: 'error.main' }}>
          Access Denied
        </DialogTitle>
        
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <AlertTitle>Access Required</AlertTitle>
            {denialReason}
          </Alert>
          
          <Typography variant="body2" color="text.secondary">
            Please contact your administrator if you believe you should have access to this resource.
          </Typography>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClosePopup} color="primary">
            Go to Dashboard
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Only render children if access is granted
  return <>{children}</>;
} 