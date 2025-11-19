import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import { Box, Button, Drawer, Stack, Typography } from '@mui/material';
import { ReactNode, useCallback } from 'react';

import {
  CONTEXT_HEADER_HEIGHT,
  DESKTOP_NAV_SIDEBAR_WIDTH,
  STICKY_BAR_HEIGHT,
} from '../layoutConstants';
import SkipToContentButton from '@/components/elements/SkipToContentButton';
import MobileMenu from '@/components/layout/nav/MobileMenu';

interface Props {
  children: ReactNode;
  navHeader?: ReactNode;
  desktopNavIsOpen: boolean;
  mobileNavIsOpen: boolean;
  handleCloseMobileMenu: VoidFunction;
  handleCloseDesktopMenu: VoidFunction;
  label: string;
  skipNavFocusTargetId: string;
  menuButtonRef?: React.RefObject<HTMLButtonElement>;
}

const CloseMenuRow = ({
  onClose,
  label,
  skipNavFocusTargetId,
  closeButtonRef,
}: {
  onClose: VoidFunction;
  skipNavFocusTargetId: string;
  label: string;
  closeButtonRef?: React.Ref<HTMLButtonElement>;
}) => (
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
    <Typography variant='body2' color='text.secondary'>
      {label}
    </Typography>
    <SkipToContentButton focusTargetId={skipNavFocusTargetId}>
      Skip {label} navigation
    </SkipToContentButton>
    <Button
      ref={closeButtonRef}
      variant='text'
      color='grayscale'
      onClick={onClose}
      startIcon={<MenuOpenIcon />}
    >
      Close
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
  label,
  skipNavFocusTargetId,
  menuButtonRef,
}) => {
  const headerHeight = `${STICKY_BAR_HEIGHT}px`;
  const height = `calc(100vh - ${headerHeight})`;

  // Callback ref that focuses the close button when drawer is open
  const closeButtonRef = useCallback(
    (node: HTMLButtonElement | null) => {
      if (node && desktopNavIsOpen) {
        // Use requestAnimationFrame to ensure element is painted and focusable
        requestAnimationFrame(() => {
          node.focus();
        });
      }
    },
    [desktopNavIsOpen]
  );

  // Return focus to menu button when closing
  const handleCloseWithFocus = () => {
    handleCloseDesktopMenu();
    // Wait .25s for drawer animation to complete (matches CSS transition duration)
    setTimeout(() => menuButtonRef?.current?.focus(), 250);
  };

  return (
    <Box
      sx={{ display: 'flex', top: headerHeight, position: 'sticky', height }}
    >
      <MobileMenu
        mobileNavIsOpen={mobileNavIsOpen}
        onCloseMobileMenu={handleCloseMobileMenu}
        navHeader={navHeader}
      >
        {children}
      </MobileMenu>
      <Drawer
        data-testid='desktopNav'
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
          maxHeight: `calc(100vh - ${STICKY_BAR_HEIGHT}px)`,
          flex: desktopNavIsOpen ? 1 : 0,
          '& > .MuiPaper-root': {
            flex: 1,
            // boxSizing: 'border-box',
            top: 'auto',
            position: 'static',
            borderTop: 'unset',
            // boxShadow: 'none',
            width: DESKTOP_NAV_SIDEBAR_WIDTH,
            transform: desktopNavIsOpen
              ? ''
              : `translateX(-${DESKTOP_NAV_SIDEBAR_WIDTH})`,
          },
        })}
      >
        <Box component='nav' aria-label='sidebar-nav'>
          <CloseMenuRow
            onClose={handleCloseWithFocus}
            label={label}
            skipNavFocusTargetId={skipNavFocusTargetId}
            closeButtonRef={closeButtonRef}
          />
          {navHeader && (
            <Box
              sx={{
                pl: 3,
                pr: 2,
                py: 2,
                borderBottomColor: 'borders.light',
                borderBottomWidth: 1,
                borderBottomStyle: 'solid',
              }}
            >
              {navHeader}
            </Box>
          )}
          {children}
        </Box>
      </Drawer>
    </Box>
  );
};

export default DashboardContentNav;
