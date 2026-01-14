import { ModuleGuard, ModuleGuardProps } from './module-guard';

export function withModuleGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  moduleGuardProps?: Omit<ModuleGuardProps, 'children'>
) {
  return function WithModuleGuardComponent(props: P) {
    return (
      <ModuleGuard {...moduleGuardProps}>
        <WrappedComponent {...props} />
      </ModuleGuard>
    );
  };
}

// Convenience functions for common module guards
export const withSalesmanGuard = <P extends object>(Component: React.ComponentType<P>) =>
  withModuleGuard(Component, { requiredModule: 'salesman' });

export const withFiveGuard = <P extends object>(Component: React.ComponentType<P>) =>
  withModuleGuard(Component, { requiredModule: 'five' });

export const withSixGuard = <P extends object>(Component: React.ComponentType<P>) =>
  withModuleGuard(Component, { requiredModule: 'six' });

// export const withCustomerGuard = <P extends object>(Component: React.ComponentType<P>) =>
//   withModuleGuard(Component, { requiredModule: 'customer' });

// export const withProductGuard = <P extends object>(Component: React.ComponentType<P>) =>
//   withModuleGuard(Component, { requiredModule: 'product' });

// export const withSalesGuard = <P extends object>(Component: React.ComponentType<P>) =>
//   withModuleGuard(Component, { requiredModule: 'sales' });

// export const withReportsGuard = <P extends object>(Component: React.ComponentType<P>) =>
//   withModuleGuard(Component, { requiredModule: 'reports' }); 