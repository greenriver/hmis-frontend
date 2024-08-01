import { Close } from '@mui/icons-material';
import { Box, Drawer, IconButton, Typography } from '@mui/material';
import React, { ReactNode } from 'react';
import UserMenu from './UserMenu';
import ToolbarMenu from '@/components/layout/nav/ToolbarMenu';
import OmniSearch from '@/modules/search/components/OmniSearch';

interface Props {
  window?: () => Window;
  children?: ReactNode;
  mobileNavIsOpen: boolean;
  handleCloseMobileMenu: VoidFunction;
  navHeader?: ReactNode;
  label?: string;
}

const MobileMenu: React.FC<Props> = ({
  window,
  children,
  mobileNavIsOpen,
  handleCloseMobileMenu,
  label,
}) => {
  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <Drawer
      data-testid='mobileNav'
      anchor='right'
      container={container}
      variant='temporary'
      open={mobileNavIsOpen}
      onClose={handleCloseMobileMenu}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
      sx={{
        zIndex: 1300,
        display: { md: 'block', lg: 'none' },
        minWidth: '320px',
      }}
    >
      <Box component='span' sx={{ position: 'absolute', right: 4, top: 4 }}>
        <IconButton
          aria-label='copy'
          onClick={handleCloseMobileMenu}
          sx={{ fontSize: 'inherit' }}
          size='large'
        >
          <Close fontSize='inherit' />
        </IconButton>
      </Box>

      <Box>
        <Typography component='h2' variant='overline' sx={{ px: 3, mt: 2 }}>
          Site Navigation
        </Typography>
        <ToolbarMenu />

        <Box sx={{ p: 2 }}>
          <OmniSearch />
        </Box>

        {children && (
          <Box
            sx={{
              m: 2,
              pt: 2,
              borderRadius: 1,
              border: (theme) => `1px solid ${theme.palette.grey[200]}`,
            }}
          >
            <Typography component='h2' variant='h5' sx={{ px: 3 }}>
              {label}
            </Typography>
            {children}
          </Box>
        )}

        <Typography component='h2' variant='overline' sx={{ px: 3 }}>
          User
        </Typography>
        <UserMenu />
      </Box>
    </Drawer>
  );
};

export default MobileMenu;
