import { useCallback, useEffect, useState } from 'react';

import useCurrentPath from './useCurrentPath';

import { FOCUS_MODE_ROUTES, HIDE_NAV_ROUTES } from '@/routes/routes';

export function useDashboardState() {
  const currentPath = useCurrentPath();
  const [desktopNavIsOpen, setDesktopNavState] = useState(true);
  const [mobileNavIsOpen, setMobileNavState] = useState(false);
  const [focusMode, setFocusMode] = useState<string | undefined>();

  useEffect(() => {
    if (!currentPath) return;
    // Auto-hide nav for certain pages, like assessments
    if (HIDE_NAV_ROUTES.includes(currentPath)) {
      setDesktopNavState(false);
    }
    // Auto-enable focus mode for certain pages, like household exit
    const focused = FOCUS_MODE_ROUTES.find(
      ({ route }) => route === currentPath
    );
    if (focused) {
      // Path that you go "back" to when exiting focus mode
      setFocusMode(focused.previous);
    } else {
      setFocusMode(undefined);
    }
  }, [currentPath]);

  useEffect(() => {
    if (focusMode) setDesktopNavState(false);
  }, [focusMode]);

  const handleCloseMobileMenu = useCallback(() => {
    setMobileNavState(false);
  }, []);
  const handleOpenMobileMenu = useCallback(() => {
    setMobileNavState(true);
  }, []);
  const handleCloseDesktopMenu = useCallback(() => {
    setDesktopNavState(false);
  }, []);
  const handleOpenDesktopMenu = useCallback(() => {
    setDesktopNavState(true);
  }, []);

  return {
    focusMode,
    desktopNavIsOpen,
    mobileNavIsOpen,
    handleCloseMobileMenu,
    handleOpenMobileMenu,
    handleCloseDesktopMenu,
    handleOpenDesktopMenu,
  };
}
