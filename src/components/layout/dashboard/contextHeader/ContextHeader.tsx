import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Box, Button } from '@mui/material';
import React, { ReactNode } from 'react';

import { useNavigate } from 'react-router-dom';
import {
  CONTEXT_HEADER_HEIGHT,
  STICKY_BAR_HEIGHT,
} from '../../layoutConstants';

import { useIsMobile } from '@/hooks/useIsMobile';
import useSafeParams from '@/hooks/useSafeParams';
import { useClientName } from '@/modules/dataFetching/hooks/useClientName';
import { clientBriefName } from '@/modules/hmis/hmisUtil';

interface Props {
  isOpen: boolean;
  handleOpenMenu: () => void;
  children?: ReactNode;
  focusMode?: string;
}

const ContextHeader: React.FC<Props> = ({
  children,
  focusMode,
  isOpen,
  handleOpenMenu,
}) => {
  const isMobile = useIsMobile();
  const params = useSafeParams();
  const { client } = useClientName(params.clientId);
  const navigate = useNavigate();
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
      }}
    >
      {focusMode ? (
        <Box>
          <Button
            onClick={() => {
              navigate(-1);
              handleOpenMenu();
            }}
            variant='transparent'
            startIcon={<ArrowBackIcon fontSize='small' />}
            sx={{ height: '32px', fontWeight: 600, ml: 2 }}
            data-testid='headerBackButton'
          >
            {`Back ${client ? 'to ' + clientBriefName(client) : ''}`}
          </Button>
        </Box>
      ) : (
        <Box display='flex' alignItems='stretch' width='100%' flex={1}>
          {(!isOpen || isMobile) && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                pl: 2,
                pr: { xs: 1, sm: 1, lg: 2 },
                borderRightColor: 'borders.light',
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
      )}
    </AppBar>
  );
};

export default ContextHeader;
