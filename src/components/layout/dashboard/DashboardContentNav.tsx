import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { Box, Button, Drawer, Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';

import { STICKY_BAR_HEIGHT } from '../MainLayout';

import { CONTEXT_HEADER_HEIGHT } from './contextHeader/ContextHeader';
import { sidebarWidth } from './DashboardContentContainer';

const SITE_HEADER_HEIGHT = STICKY_BAR_HEIGHT;

interface Props {
  children: ReactNode;
  navHeader: ReactNode;
  desktopNavIsOpen: boolean;
  mobileNavIsOpen: boolean;
  handleCloseMobileMenu: VoidFunction;
  handleCloseDesktopMenu: VoidFunction;
  window?: () => Window;
}

const CloseMenuRow = ({ onClose }: { onClose: VoidFunction }) => (
  <Stack
    justifyContent='space-between'
    alignItems='center'
    direction='row'
    sx={{
      p: 0.5,
      pl: 2,
      borderBottomColor: 'borders.light',
      borderBottomWidth: 1,
      borderBottomStyle: 'solid',
      height: CONTEXT_HEADER_HEIGHT,
    }}
  >
    <Typography variant='h6'>Menu</Typography>
    <Button
      variant='transparent'
      onClick={onClose}
      endIcon={<ChevronLeftIcon fontSize='small' />}
      size='small'
    >
      Hide
    </Button>
  </Stack>
);

const DashboardContentNav: React.FC<Props> = ({
  navHeader,
  children,
  desktopNavIsOpen,
  mobileNavIsOpen,
  handleCloseMobileMenu,
  handleCloseDesktopMenu,
  window,
}) => {
  const container =
    window !== undefined ? () => window().document.body : undefined;
  const headerHeight = `${SITE_HEADER_HEIGHT}px`;
  const height = `calc(100vh - ${headerHeight})`;
  return (
    <Box
      sx={{ display: 'flex', top: headerHeight, position: 'sticky', height }}
    >
      <Drawer
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
        }}
      >
        <CloseMenuRow onClose={handleCloseMobileMenu} />
        <Box>{children}</Box>
      </Drawer>
      <Drawer
        anchor='left'
        open={desktopNavIsOpen}
        onClose={handleCloseDesktopMenu}
        variant='persistent'
        elevation={0}
        sx={(theme) => ({
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'transform .25s ease-in-out',
          zIndex: theme.zIndex.modal - 1,
          maxHeight: `calc(100vh - ${SITE_HEADER_HEIGHT}px)`,
          flex: desktopNavIsOpen ? 1 : 0,
          '& > .MuiPaper-root': {
            flex: 1,
            // boxSizing: 'border-box',
            top: 'auto',
            position: 'static',
            borderTop: 'unset',
            // boxShadow: 'none',
            width: sidebarWidth,
            transform: desktopNavIsOpen ? '' : `translateX(-${sidebarWidth})`,
          },
        })}
      >
        <Box>
          <CloseMenuRow onClose={handleCloseDesktopMenu} />
          <Box
            sx={{
              px: 2,
              py: 2,
              borderBottomColor: 'borders.light',
              borderBottomWidth: 1,
              borderBottomStyle: 'solid',
            }}
          >
            {navHeader}
          </Box>
          {children}
        </Box>
      </Drawer>
    </Box>
  );
};

export default DashboardContentNav;
