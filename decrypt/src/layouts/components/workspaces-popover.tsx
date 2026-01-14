'use client';

import type { Theme, SxProps } from '@mui/material/styles';
import type { ButtonBaseProps } from '@mui/material/ButtonBase';

import { useState, useCallback, useEffect } from 'react';
import { usePopover } from 'minimal-shared/hooks';
import { useSelector, useDispatch } from 'react-redux';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import Button, { buttonClasses } from '@mui/material/Button';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomPopover } from 'src/components/custom-popover';

import type { RootState } from 'src/redux/store';
import { selectCompany } from 'src/redux/slices/authSlice';

// ----------------------------------------------------------------------

export type WorkspacesPopoverProps = ButtonBaseProps & {
  data?: {
    id: string;
    name: string;
    logo: string;
    plan: string;
  }[];
};

export function WorkspacesPopover({ data = [], sx, ...other }: WorkspacesPopoverProps) {
  const mediaQuery = 'sm';
  const dispatch = useDispatch();

  const { open, anchorEl, onClose, onOpen } = usePopover();

  // Get companies and selected company from Redux store
  const { companies, selectedCompanyId, loading: authLoading } = useSelector((state: RootState) => state.auth);

  // Find the currently selected company
  const selectedCompany = companies.find((company) => company.id === selectedCompanyId);

  // Determine which data source to use - prioritize Redux companies
  const useReduxData = companies.length > 0;
  const workspaceData = useReduxData ? companies : data;

  // Local workspace state for UI
  const [workspace, setWorkspace] = useState(selectedCompany || workspaceData[0]);

  // Update workspace when Redux state changes or data changes
  useEffect(() => {
    if (selectedCompany) {
      setWorkspace(selectedCompany);
    } else if (workspaceData.length > 0) {
      setWorkspace(workspaceData[0]);
    }
  }, [selectedCompany, workspaceData]);

  const handleChangeWorkspace = useCallback(
    (newValue: typeof companies[0] | typeof data[0]) => {
      // Check if the new value is from companies (Redux) or external data
      if ('modules' in newValue && 'permissions' in newValue) {
        dispatch(selectCompany(newValue.id));
        setWorkspace(newValue);
      } else {
        // It's external workspace data - find matching company by ID
        const workspaceId = typeof newValue.id === 'string' ? parseInt(newValue.id, 10) : newValue.id;
        const matchingCompany = companies.find((c) => c.id === workspaceId);
        
        if (matchingCompany) {
          dispatch(selectCompany(matchingCompany.id));
          setWorkspace(matchingCompany);
        } else {
          // If no matching company found, update local state only
          // This can happen when companies are not yet loaded from auth
          setWorkspace(newValue);
        }
      }
      onClose();
    },
    [dispatch, companies, onClose]
  );

  const buttonBg: SxProps<Theme> = {
    height: 1,
    zIndex: -1,
    opacity: 0,
    content: "''",
    borderRadius: 1,
    position: 'absolute',
    visibility: 'hidden',
    bgcolor: 'action.hover',
    width: 'calc(100% + 8px)',
    transition: (theme) =>
      theme.transitions.create(['opacity', 'visibility'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.shorter,
      }),
    ...(open && {
      opacity: 1,
      visibility: 'visible',
    }),
  };

  const renderButton = () => (
    <ButtonBase
      disableRipple
      onClick={onOpen}
      sx={[
        {
          py: 0.5,
          gap: { xs: 0.5, [mediaQuery]: 1 },
          '&::before': buttonBg,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Avatar
        alt={workspace?.name}
        src={workspace?.logo}
        sx={{ width: 24, height: 24, fontSize: '0.75rem' }}
      >
        {workspace?.name?.charAt(0).toUpperCase() || '?'}
      </Avatar>

      <Box
        component="span"
        sx={{ typography: 'subtitle2', display: { xs: 'none', [mediaQuery]: 'inline-flex' } }}
      >
        {workspace?.name}
      </Box>

      <Label
        color={(workspace?.plan || 'Free') === 'Free' ? 'default' : 'info'}
        sx={{
          height: 22,
          cursor: 'inherit',
          display: { xs: 'none', [mediaQuery]: 'inline-flex' },
        }}
      >
        {workspace?.plan || 'Free'}
      </Label>

      <Iconify width={16} icon="carbon:chevron-sort" sx={{ color: 'text.disabled' }} />
    </ButtonBase>
  );

  const renderMenuList = () => {
    return (
      <CustomPopover
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        slotProps={{
          arrow: { placement: 'top-left' },
          paper: { sx: { mt: 0.5, ml: -1.55, width: 240 } },
        }}
      >
        <Scrollbar sx={{ maxHeight: 240 }}>
          <MenuList>
            {workspaceData.map((option) => {
              const isCompanyFromRedux = 'modules' in option && 'permissions' in option;
              const optionId = isCompanyFromRedux ? option.id : parseInt(option.id, 10);
              const isSelected = optionId === selectedCompanyId || option.id === workspace?.id;

              return (
                <MenuItem
                  key={option.id}
                  selected={isSelected}
                  onClick={() => handleChangeWorkspace(option)}
                  sx={{ height: 48 }}
                >
                  <Avatar
                    alt={option.name}
                    src={option.logo}
                    sx={{ width: 24, height: 24, fontSize: '0.75rem' }}
                  >
                    {option.name?.charAt(0).toUpperCase() || '?'}
                  </Avatar>

                  <Typography
                    noWrap
                    component="span"
                    variant="body2"
                    sx={{ flexGrow: 1, fontWeight: 'fontWeightMedium' }}
                  >
                    {option.name}
                  </Typography>

                  <Label color={(option.plan || 'Free') === 'Free' ? 'default' : 'info'}>
                    {option.plan || 'Free'}
                  </Label>
                </MenuItem>
              );
            })}
          </MenuList>
        </Scrollbar>

        <Divider sx={{ my: 0.5, borderStyle: 'dashed' }} />

        <Button
          fullWidth
          startIcon={<Iconify width={18} icon="mingcute:add-line" />}
          onClick={() => {
            onClose();
          }}
          sx={{
            gap: 2,
            justifyContent: 'flex-start',
            fontWeight: 'fontWeightMedium',
            [`& .${buttonClasses.startIcon}`]: {
              m: 0,
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
          }}
        >
          Create subcompany
        </Button>
      </CustomPopover>
    );
  };

  return (
    <>
      {renderButton()}
      {renderMenuList()}
    </>
  );
}
