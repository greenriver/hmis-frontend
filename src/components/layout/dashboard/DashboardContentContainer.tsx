import { Box, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ReactNode } from 'react';

import { DESKTOP_NAV_SIDEBAR_WIDTH } from '../layoutConstants';

import ContextHeader from './contextHeader/ContextHeader';
import DashboardContentNav from './DashboardContentNav';

import { useIsMobile } from '@/hooks/useIsMobile';
import SentryErrorBoundary from '@/modules/errors/components/SentryErrorBoundary';

interface Props {
  children: ReactNode;
  sidebar?: ReactNode;
  header?: ReactNode;
  contextHeader?: ReactNode;
  navHeader: ReactNode;
  desktopNavIsOpen: boolean;
  mobileNavIsOpen: boolean;
  focusMode?: string;
  navLabel?: string;
  handleOpenDesktopMenu: VoidFunction;
  handleOpenMobileMenu: VoidFunction;
  handleCloseMobileMenu: VoidFunction;
  handleCloseDesktopMenu: VoidFunction;
}

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
  navLabel,
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
            label={navLabel}
          >
            {sidebar}
          </DashboardContentNav>
        )}
        <Box
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
              focusMode={!!focusMode}
              focusModeDefaultReturnPath={focusMode}
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
              pt: 2,
              pb: 8,
              px: { xs: 1, sm: 3, lg: 4 },
              maxWidth: `${maxPageWidth}px`,
            }}
          >
            <Box key='content' component='main'>
              <SentryErrorBoundary>{children}</SentryErrorBoundary>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardContentContainer;
