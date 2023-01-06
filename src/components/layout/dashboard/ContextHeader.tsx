import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Box, Button } from '@mui/material';
// import { DEFAULT_MARGIN_STR, SITE_HEADER_HEIGHT } from "layout/configuration";
// import { useTheme } from '@mui/material/styles';
import React, { ReactNode } from 'react';

import { STICKY_BAR_HEIGHT } from '../MainLayout';
// import MenuButton from "common/components/Buttons/MenuButton";
// import { useIsMobile } from "common/util/hooks/useIsMobile";

interface Props {
  isOpen: boolean;
  handleOpenMenu: () => void;
  children?: ReactNode;
}

export const CONTEXT_HEADER_HEIGHT = 48;

const ContextHeader: React.FC<Props> = ({
  children,
  isOpen,
  handleOpenMenu,
}) => {
  // const theme = useTheme();
  const isMobile = false; //useIsMobile();
  return (
    <AppBar
      position='sticky'
      color='default'
      elevation={0}
      sx={{
        borderTop: 'unset',
        borderLeft: 'unset',
        height: CONTEXT_HEADER_HEIGHT,
        alignItems: 'stretch',
        justifyContent: 'center',
        top: STICKY_BAR_HEIGHT,
        backgroundColor: 'white',
        borderBottomWidth: '1px',
        borderBottomColor: 'borders.light',
        borderBottomStyle: 'solid',
        py: 0,
        px: { sm: 1, lg: 2 },
      }}
    >
      <Box display='flex' alignItems='stretch' width='100%' flex={1}>
        {!isOpen && !isMobile && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mr: { sm: 3, lg: 4 },
              pr: { sm: 1, lg: 2 },
              borderRightColor: isMobile ? 'transparent' : 'borders.light',
              borderRightWidth: 1,
              borderRightStyle: 'solid',
            }}
          >
            <Button
              startIcon={<MenuIcon />}
              variant='transparent'
              onClick={handleOpenMenu}
            >
              Menu
            </Button>
          </Box>
        )}
        {children}
      </Box>
    </AppBar>
  );
};

export default ContextHeader;
