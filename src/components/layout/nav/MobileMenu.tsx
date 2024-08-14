import { Close } from '@mui/icons-material';
import {
  Box,
  Drawer,
  IconButton,
  List,
  Stack,
  Typography,
} from '@mui/material';
import React, { ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import MobileUserMenu from '@/components/layout/nav/MobileUserMenu';
import ToolbarMenu from '@/components/layout/nav/ToolbarMenu';
import { scrollToElement } from '@/hooks/useScrollToHash';
import { useHmisAppSettings } from '@/modules/hmisAppSettings/useHmisAppSettings';

interface Props {
  window?: () => Window;
  children?: ReactNode;
  mobileNavIsOpen: boolean;
  onCloseMobileMenu: VoidFunction;
  navHeader?: ReactNode;
}

const MobileMenu: React.FC<Props> = ({
  window,
  children,
  mobileNavIsOpen,
  onCloseMobileMenu,
  navHeader,
}) => {
  const { appName } = useHmisAppSettings();
  const container =
    window !== undefined ? () => window().document.body : undefined;

  // close the menu on nav
  const { pathname } = useLocation();
  useEffect(() => {
    onCloseMobileMenu();
  }, [pathname, onCloseMobileMenu]);

  // if there is a child menu for dashboard nav items, scroll to top of it on open
  useEffect(() => {
    setTimeout(() => {
      const element = document.getElementById('dashboard-nav-menu');
      scrollToElement(element, 0);
    }, 0);
  }, [pathname]);

  return (
    <Drawer
      data-testid='mobileNav'
      anchor='right'
      container={container}
      variant='temporary'
      open={mobileNavIsOpen}
      onClose={onCloseMobileMenu}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
      sx={({ zIndex }) => ({
        zIndex: zIndex.modal,
        display: { md: 'block', lg: 'none' },
        overflow: 'hidden',
        height: '100%',
      })}
    >
      <Stack
        direction='row'
        sx={({ zIndex }) => ({
          boxShadow: children ? 2 : undefined,
          zIndex: zIndex.appBar,
          minWidth: '320px',
        })}
      >
        <Typography
          component='h2'
          variant='overline'
          sx={{ ml: 2, mr: 'auto', mt: 0.5 }}
        >
          {appName || 'Open Path HMIS'}
        </Typography>
        <IconButton
          aria-label='close'
          onClick={onCloseMobileMenu}
          sx={{ fontSize: 'inherit' }}
          size='large'
        >
          <Close fontSize='inherit' />
        </IconButton>
      </Stack>
      {navHeader && (
        <Box
          sx={({ palette }) => ({
            px: 3,
            py: 2,
            borderBottom: `1px solid ${palette.divider}`,
          })}
        >
          {navHeader}
        </Box>
      )}

      {/* If we child nav items for a dashboard, render them in a scrollable area */}
      {children && (
        <Box sx={{ flex: '1', overflowY: 'scroll' }}>
          <Box
            id='dashboard-nav-menu'
            sx={({ palette }) => ({ background: palette.grey[100] })}
          >
            {children}
          </Box>
        </Box>
      )}

      {/* Navigation for top-level items (Clients, Projects, Admin) */}
      <Box
        sx={({ palette }) => ({
          flex: '1',
          borderTop: `1px solid ${palette.divider}`,
        })}
      >
        <List disablePadding>
          <ToolbarMenu mobile />
          <MobileUserMenu />
        </List>
      </Box>
    </Drawer>
  );
};

export default MobileMenu;
