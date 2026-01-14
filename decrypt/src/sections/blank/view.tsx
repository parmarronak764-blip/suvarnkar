'use client';

import type { Theme, SxProps } from '@mui/material/styles';

import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import { useSelector } from 'react-redux';
import { RootState } from 'src/redux/store';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  description?: string;
  sx?: SxProps<Theme>;
  requiredPermissions?: string[]; // add this prop to pass required permissions
};

export function BlankView({ title = 'Blank', description, sx, requiredPermissions }: Props) {
  const { companies, selectedCompanyId } = useSelector((state: RootState) => state.auth);
  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);
  const userPermissions = selectedCompany?.permissions || [];

  // Check if user has any of the required permissions
  const hasPermission =
    !requiredPermissions || requiredPermissions.length === 0
      ? true
      : requiredPermissions.some((perm) => userPermissions.includes(perm));

  const renderContent = () => (
    <Box
      sx={[
        (theme) => ({
          mt: 5,
          width: 1,
          height: 320,
          borderRadius: 2,
          border: `dashed 1px ${theme.vars.palette.divider}`,
          bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.04),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    />
  );

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4">{title}</Typography>
      {description && <Typography sx={{ mt: 1 }}>{description}</Typography>}

      {hasPermission ? (
        <>
          <Typography sx={{ mt: 3, mb: 2 }}>
            You have the required permission(s) to view this content.
          </Typography>
          {renderContent()}
        </>
      ) : (
        <Typography sx={{ mt: 3, color: 'error.main' }}>
          You do not have permission to view this content.
        </Typography>
      )}
    </DashboardContent>
  );
}

