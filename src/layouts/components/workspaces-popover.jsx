import { useState, useCallback, useEffect } from 'react';
import { usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import Button, { buttonClasses } from '@mui/material/Button';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomPopover } from 'src/components/custom-popover';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedCompany } from 'src/redux/slices/user.slice';
import { getCompanyLogoUrl } from 'src/utils/image-url';

// ----------------------------------------------------------------------

export function WorkspacesPopover({ data = [], sx, ...other }) {
  const accountInfo = useSelector((state) => state.user.accountInfo);
  const selectedCompany = useSelector((state) => state.user.selectedCompany);
  const dispatch = useDispatch();
  const mediaQuery = 'sm';

  const { open, anchorEl, onClose, onOpen } = usePopover();

  const [workspace, setWorkspace] = useState(null);

  const handleChangeWorkspace = useCallback(
    (newCompany) => {
      setWorkspace(newCompany);
      console.log('Selected company:', newCompany);

      // Find the complete company_user object from accountInfo
      const selectedCompanyUser = accountInfo?.company_users?.find(
        (companyUser) => companyUser.company.id === newCompany.id
      );

      if (selectedCompanyUser) {
        dispatch(setSelectedCompany(selectedCompanyUser));
      }
      onClose();
    },
    [onClose, dispatch, accountInfo]
  );

  useEffect(() => {
    if (selectedCompany?.company) {
      setWorkspace(selectedCompany.company);
    } else if (accountInfo?.company_users?.length > 0) {
      // Set the first company as selected if none is selected
      const firstCompany = accountInfo.company_users[0];
      console.log('Setting first company as selected:', firstCompany);
      dispatch(setSelectedCompany(firstCompany));
      setWorkspace(firstCompany.company);
    } else if (data?.length > 0) {
      // Fallback to first item in data if available
      setWorkspace(data[0]);
    }
  }, [accountInfo, selectedCompany, dispatch, data]);

  const buttonBg = {
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
      {workspace?.logo && (
        <Box
          component="img"
          alt={workspace?.name}
          src={getCompanyLogoUrl(workspace?.logo)}
          sx={{ width: 24, height: 24, borderRadius: '50%' }}
        />
      )}

      <Box
        component="span"
        sx={{ typography: 'subtitle2', display: { xs: 'none', [mediaQuery]: 'inline-flex' } }}
      >
        {workspace?.name}
      </Box>

      {/* <Label
        color={workspace?.plan === 'Free' ? 'default' : 'info'}
        sx={{
          height: 22,
          cursor: 'inherit',
          display: { xs: 'none', [mediaQuery]: 'inline-flex' },
        }}
      >
        {workspace?.plan}
      </Label> */}

      <Iconify width={16} icon="carbon:chevron-sort" sx={{ color: 'text.disabled' }} />
    </ButtonBase>
  );

  const renderMenuList = () => (
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
          {data?.map((option) => (
            <MenuItem
              key={option.id}
              selected={option.id === workspace?.id}
              onClick={() => handleChangeWorkspace(option)}
              sx={{ height: 48 }}
            >
              {option.logo && (
                <Avatar
                  alt={option.name}
                  src={getCompanyLogoUrl(option.logo)}
                  sx={{ width: 24, height: 24 }}
                />
              )}

              <Typography
                noWrap
                component="span"
                variant="body2"
                sx={{ flexGrow: 1, fontWeight: 'fontWeightMedium' }}
              >
                {option.name}
              </Typography>

              {/* <Label color={option.plan === 'Free' ? 'default' : 'info'}>{option.plan}</Label> */}
            </MenuItem>
          ))}
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
        Create Company
      </Button>
    </CustomPopover>
  );

  return (
    <>
      {renderButton()}
      {renderMenuList()}
    </>
  );
}
