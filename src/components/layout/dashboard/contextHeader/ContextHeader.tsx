import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuIcon from '@mui/icons-material/Menu';
import { Box, Button } from '@mui/material';
import React, { ReactNode, useCallback, useMemo } from 'react';

import { NavigateOptions, useLocation, useNavigate } from 'react-router-dom';
import CommonStickyBar from '../../CommonStickyBar';
import {
  CONTEXT_HEADER_HEIGHT,
  STICKY_BAR_HEIGHT,
} from '../../layoutConstants';

import { useIsMobile } from '@/hooks/useIsMobile';
import useSafeParams from '@/hooks/useSafeParams';
import { useClientName } from '@/modules/dataFetching/hooks/useClientName';
import { clientBriefName } from '@/modules/hmis/hmisUtil';
import {
  locationFromDefaultOrLogin,
  EXPAND_DESKTOP_NAV_KEY,
} from '@/routes/routeUtil';
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
  <CommonStickyBar
    height={CONTEXT_HEADER_HEIGHT}
    top={STICKY_BAR_HEIGHT}
    isStickyOnMobile={true}
    sx={{
      alignItems: 'stretch',
      justifyContent: 'center',
    }}
  >
    {children}
  </CommonStickyBar>
);

const ContextHeader: React.FC<Props> = ({
  children,
  focusMode,
  focusModeDefaultReturnPath,
  isOpen,
  handleOpenMenu,
}) => {
  const isMobile = useIsMobile();
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

    // When navigating out of focus mode, pass special state to re-expand the desktop nav
    const navOptions: NavigateOptions = {
      state: { [EXPAND_DESKTOP_NAV_KEY]: true },
    };

    if (location?.state?.focusModeReturnPath) {
      navigate(location.state.focusModeReturnPath, navOptions);
    } else if (
      locationFromDefaultOrLogin(location) &&
      focusModeDefaultReturnPath
    ) {
      // This page was loaded directly, so go "back" to the default path
      const defaultBackPath = generateSafePath(focusModeDefaultReturnPath, {
        clientId,
        enrollmentId,
      });
      navigate(defaultBackPath, navOptions);
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
            variant='text'
            color='grayscale'
            startIcon={<ArrowBackIcon fontSize='small' />}
            sx={{ height: '32px', fontWeight: 600, ml: 2 }}
            data-testid='headerBackButton'
          >
            {backToLabel}
          </Button>
        </Box>
      ) : (
        <Box display='flex' alignItems='stretch' width='100%' flex={1}>
          {!isOpen && !isMobile && (
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
                variant='text'
                color='grayscale'
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
