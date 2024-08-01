import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Box, CssBaseline, IconButton, Toolbar } from '@mui/material';
import { Stack } from '@mui/system';
import * as React from 'react';
import RouterLink from '../elements/RouterLink';

import {
  APP_BAR_HEIGHT,
  OP_LINK_BAR_HEIGHT,
  SHOW_OP_LINK_BAR,
} from './layoutConstants';
import UserMenu from './nav/UserMenu';
import PrintViewButton from './PrintViewButton';
import WarehouseLinkBar from './WarehouseLinkBar';

import Loading from '@/components/elements/Loading';
import MobileMenu from '@/components/layout/nav/MobileMenu';
import ToolbarMenu from '@/components/layout/nav/ToolbarMenu';
import { useIsDashboard } from '@/components/layout/nav/useIsDashboard';
import { MobileMenuContext } from '@/components/layout/nav/useMobileMenuContext';
import { useIsMobile } from '@/hooks/useIsMobile';
import useIsPrintView from '@/hooks/useIsPrintView';
import { useHmisAppSettings } from '@/modules/hmisAppSettings/useHmisAppSettings';
import OmniSearch from '@/modules/search/components/OmniSearch';
import { useGetRootPermissionsQuery } from '@/types/gqlTypes';

interface Props {
  mobileMenuContext: MobileMenuContext;
  children: React.ReactNode;
}

const MainLayout: React.FC<Props> = ({ mobileMenuContext, children }) => {
  const { appName } = useHmisAppSettings();
  const isPrint = useIsPrintView();

  // Load root permissions into the cache before loading the page
  const {
    data,
    loading: permissionLoading,
    error,
  } = useGetRootPermissionsQuery();

  const isMobile = useIsMobile();
  const { mobileNavIsOpen, handleOpenMobileMenu, handleCloseMobileMenu } =
    mobileMenuContext;
  const isDashboard = useIsDashboard();

  if (error) throw error;

  if (permissionLoading && !data) return <Loading />;

  if (isPrint)
    return (
      <>
        <CssBaseline />
        <Box
          sx={(theme) => ({
            position: 'fixed',
            right: theme.spacing(1),
            top: theme.spacing(1),
            backgroundColor: theme.palette.background.paper,
            '& > *': {
              boxShadow: `${theme.shadows[2]} !important`,
            },
            '@media print': {
              '&': {
                display: 'none',
              },
            },
          })}
        >
          <PrintViewButton exit />
        </Box>
        {children}
      </>
    );

  return (
    <React.Fragment>
      {SHOW_OP_LINK_BAR && <WarehouseLinkBar />}
      <AppBar
        position='sticky'
        color='default'
        elevation={0}
        sx={{
          height: APP_BAR_HEIGHT,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          top: SHOW_OP_LINK_BAR ? OP_LINK_BAR_HEIGHT : 0,
          backgroundColor: 'white',
          '&.MuiPaper-root': {
            borderLeft: 'unset',
            borderRight: 'unset',
            borderTop: 'unset',
          },
        }}
      >
        <Toolbar sx={{ px: 3, minHeight: APP_BAR_HEIGHT }}>
          <RouterLink
            variant='h1'
            noWrap
            underline='none'
            to='/'
            sx={{
              color: 'text.primary',
              fontSize: 20,
              fontWeight: 600,
            }}
          >
            {appName || 'Open Path HMIS'}
          </RouterLink>
          <Box display='flex' sx={{ flexGrow: 1 }}></Box>
          {!isMobile && (
            <Stack direction='row' spacing={{ md: 0.5, lg: 2 }}>
              <ToolbarMenu />
              <OmniSearch />
              <UserMenu />
            </Stack>
          )}
          {isMobile && (
            <>
              <IconButton
                aria-label='Navigation'
                sx={{ color: 'text.primary' }}
                onClick={() => handleOpenMobileMenu()}
              >
                <MenuIcon />
              </IconButton>
              {!isDashboard && (
                // Dashboards render their own Mobile Menus with additional nav elements inside.
                <MobileMenu
                  mobileNavIsOpen={mobileNavIsOpen}
                  handleCloseMobileMenu={handleCloseMobileMenu}
                />
              )}
            </>
          )}
        </Toolbar>
      </AppBar>
      <CssBaseline />
      {children}
    </React.Fragment>
  );
};

export default MainLayout;
