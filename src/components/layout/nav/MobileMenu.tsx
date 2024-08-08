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
import OmniSearch from '@/modules/search/components/OmniSearch';

interface Props {
  window?: () => Window;
  children?: ReactNode;
  mobileNavIsOpen: boolean;
  onCloseMobileMenu: VoidFunction;
  navHeader?: ReactNode;
  label?: string;
}

const MobileMenu: React.FC<Props> = ({
  window,
  children,
  mobileNavIsOpen,
  onCloseMobileMenu,
  label,
}) => {
  const container =
    window !== undefined ? () => window().document.body : undefined;

  // close the menu on nav
  const { pathname } = useLocation();
  useEffect(() => {
    onCloseMobileMenu();
  }, [pathname, onCloseMobileMenu]);

  // TODO: hook to scroll to top of menu on open

  const nav = (
    <List>
      <ToolbarMenu />
      <MobileUserMenu />
    </List>
  );
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
          {label || 'Site Navigation'}
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

      {children && (
        <>
          <Box sx={{ flex: '1', overflowY: 'scroll' }}>
            <Box sx={({ palette }) => ({ background: palette.grey[100] })}>
              {children}
            </Box>
          </Box>
          <Box
            sx={({ palette }) => ({
              flex: '1',
              pt: 2,
              borderTop: `1px solid ${palette.divider}`,
            })}
          >
            <Box sx={{ mx: 2, mb: 0 }}>
              <OmniSearch />
            </Box>
            {nav}
          </Box>
        </>
      )}
      {!children && (
        <>
          <Box sx={{ mx: 2, mb: 0, mt: 2 }}>
            <OmniSearch />
          </Box>
          {nav}
        </>
      )}
    </Drawer>
  );
};

export default MobileMenu;
