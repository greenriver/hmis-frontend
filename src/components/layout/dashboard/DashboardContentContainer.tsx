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
  handleOpenDesktopMenu: VoidFunction;
  handleOpenMobileMenu: VoidFunction;
  handleCloseMobileMenu: VoidFunction;
  handleCloseDesktopMenu: VoidFunction;
}

export const sidebarWidth = 300;

const DashboardContentContainer: React.FC<Props> = ({
  children,
  sidebar,
  header,
  contextHeader,
  desktopNavIsOpen,
  mobileNavIsOpen,
  navHeader,
  handleOpenDesktopMenu,
  handleOpenMobileMenu,
  handleCloseMobileMenu,
  handleCloseDesktopMenu,
}) => {
  const theme = useTheme();
  const maxPageWidth = theme.breakpoints.values.xl;
  const desktopContainerWidth = desktopNavIsOpen
    ? `calc(100vw - ${sidebarWidth}px)`
    : '100vw';
  const desktopTransform = desktopNavIsOpen
    ? ''
    : `translateX(-${sidebarWidth}px)`;
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
          sx={{
            minWidth: { sm: '100vh', md: desktopContainerWidth },
            transition:
              'min-width .25s ease-in-out, transform .25s ease-in-out',
            transform: { sm: 'none', md: desktopTransform },
          }}
        >
          {contextHeader && (
            <ContextHeader
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
              py: { sm: 2 },
              px: { sm: 3, lg: 4 },
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
