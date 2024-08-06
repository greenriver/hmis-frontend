import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Box, Button } from '@mui/material';
import React, { ReactNode, useCallback, useMemo } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';
import {
  CONTEXT_HEADER_HEIGHT,
  STICKY_BAR_HEIGHT,
} from '../../layoutConstants';
import useSafeParams from '@/hooks/useSafeParams';
import { useClientName } from '@/modules/dataFetching/hooks/useClientName';
import { clientBriefName } from '@/modules/hmis/hmisUtil';
import { locationFromDefaultOrLogin } from '@/routes/routeUtil';
import { generateSafePath } from '@/utils/pathEncoding';

interface Props {
  isOpen: boolean;
  handleOpenMenu: () => void;
  children?: ReactNode;
  focusMode?: boolean;
  focusModeDefaultReturnPath?: string;
}

export const ContextHeaderAppBar: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <AppBar
    position='sticky'
    color='default'
    elevation={0}
    sx={{
      borderTop: 'unset',
      borderLeft: 'unset',
      borderRight: 'unset',
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
    {children}
  </AppBar>
);

const ContextHeader: React.FC<Props> = ({
  children,
  focusMode,
  focusModeDefaultReturnPath,
  isOpen,
  handleOpenMenu,
}) => {
  const { clientId, enrollmentId } = useSafeParams();
  const { client } = useClientName(clientId);
  const navigate = useNavigate();
  const location = useLocation();

  // Try to guess which path we should link to in the "back" button on the app bar if this is Focus Mode.
  // Not ideal, it would be better if the content specified exactly where to go back to, but this works for now.

  const backToLabel = useMemo(() => {
    const state = location.state;
    if (state?.backToLabel) {
      return `Back to ${state?.backToLabel}`;
    }
    if (client) {
      return `Back to ${clientBriefName(client)}`;
    }
    return 'Back';
  }, [client, location.state]);

  const exitFocusMode = useCallback(() => {
    if (!focusMode) return;

    if (locationFromDefaultOrLogin(location) && focusModeDefaultReturnPath) {
      // This page was loaded directly, so go "back" to the default path
      const defaultBackPath = generateSafePath(focusModeDefaultReturnPath, {
        clientId,
        enrollmentId,
      });
      navigate(defaultBackPath);
    } else {
      navigate(-1);
    }

    handleOpenMenu(); // expand left nav
  }, [
    clientId,
    enrollmentId,
    focusMode,
    focusModeDefaultReturnPath,
    handleOpenMenu,
    location,
    navigate,
  ]);

  return (
    <ContextHeaderAppBar>
      {focusMode ? (
        <Box>
          <Button
            onClick={exitFocusMode}
            variant='transparent'
            startIcon={<ArrowBackIcon fontSize='small' />}
            sx={{ height: '32px', fontWeight: 600, ml: 2 }}
            data-testid='headerBackButton'
          >
            {backToLabel}
          </Button>
        </Box>
      ) : (
        <Box display='flex' alignItems='stretch' width='100%' flex={1}>
          {!isOpen && (
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
    </ContextHeaderAppBar>
  );
};

export default ContextHeader;
