import { Box, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ReactNode } from 'react';

import ContextHeader from './contextHeader/ContextHeader';
import DashboardContentNav from './DashboardContentNav';

import { useIsMobile } from '@/hooks/useIsMobile';

interface Props {
  children: ReactNode;
  sidebar?: ReactNode;
  header?: ReactNode;
  contextHeader?: ReactNode;
  navHeader: ReactNode;
  desktopNavIsOpen: boolean;
  mobileNavIsOpen: boolean;
  focusMode?: string;
  handleOpenDesktopMenu: VoidFunction;
  handleOpenMobileMenu: VoidFunction;
  handleCloseMobileMenu: VoidFunction;
  handleCloseDesktopMenu: VoidFunction;
}

export const DESKTOP_NAV_SIDEBAR_WIDTH = 300;

const DashboardContentContainer: React.FC<Props> = ({
  children,
  sidebar,
  header,
  contextHeader,
  desktopNavIsOpen,
  mobileNavIsOpen,
  navHeader,
  focusMode,
  handleOpenDesktopMenu,
  handleOpenMobileMenu,
  handleCloseMobileMenu,
  handleCloseDesktopMenu,
}) => {
  const theme = useTheme();
  const maxPageWidth = theme.breakpoints.values.xl;

  const desktopContainerWidth = desktopNavIsOpen
    ? // FIXME using vw causes horizontal scrollbar when vertical scroll is present
      // Need to add -15px (or width of scrollbar) to calc if vertical scrollbar is present
      `calc(100vw - ${DESKTOP_NAV_SIDEBAR_WIDTH}px)`
    : '100vw';
  const desktopTransform = desktopNavIsOpen
    ? ''
    : `translateX(-${DESKTOP_NAV_SIDEBAR_WIDTH}px)`;
  const isMobile = useIsMobile();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        flexDirection: 'column',
        flex: '1 1 auto',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          flex: '1 1 100%',
          alignItems: 'flex-start',
          maxWidth: '100%',
          width: isMobile ? '100%' : undefined,
        }}
      >
        {sidebar && (
          <DashboardContentNav
            navHeader={navHeader}
            desktopNavIsOpen={desktopNavIsOpen}
            mobileNavIsOpen={mobileNavIsOpen}
            handleCloseMobileMenu={handleCloseMobileMenu}
            handleCloseDesktopMenu={handleCloseDesktopMenu}
          >
            {sidebar}
          </DashboardContentNav>
        )}
        <Box
          component='main'
          sx={
            isMobile
              ? { width: '100%' }
              : {
                  minWidth: { sm: '100vh', md: desktopContainerWidth },
                  transition:
                    'min-width .25s ease-in-out, transform .25s ease-in-out',
                  transform: { sm: 'none', md: desktopTransform },
                }
          }
        >
          {contextHeader && (
            <ContextHeader
              focusMode={focusMode}
              isOpen={desktopNavIsOpen}
              handleOpenMenu={
                isMobile ? handleOpenMobileMenu : handleOpenDesktopMenu
              }
            >
              {contextHeader}
            </ContextHeader>
          )}
          {header && (
            <Paper square sx={{ background: theme.palette.common.white }}>
              <Box>{header}</Box>
            </Paper>
          )}
          <Box
            sx={{
              py: { xs: 1, sm: 2 },
              px: { xs: 2, sm: 3, lg: 4 },
              maxWidth: `${maxPageWidth}px`,
            }}
          >
            <Box key='content' component='main'>
              {children}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardContentContainer;
