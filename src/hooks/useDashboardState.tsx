import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import useCurrentPath from './useCurrentPath';
import { useMobileMenu } from '@/components/layout/nav/useMobileMenuContext';
import {
  FOCUS_MODE_ROUTES,
  HIDE_NAV_ROUTES,
  NO_PADDING_ROUTES,
} from '@/routes/routes';
import { EXPAND_DESKTOP_NAV_KEY } from '@/routes/routeUtil';

export function useDashboardState() {
  const currentPath = useCurrentPath();
  const { state } = useLocation();
  const { mobileNavIsOpen, handleCloseMobileMenu, handleOpenMobileMenu } =
    useMobileMenu();

  const [desktopNavIsOpen, setDesktopNavState] = useState(true);
  const [focusMode, setFocusMode] = useState<string | undefined>();

  useEffect(() => {
    if (!currentPath) return;
    // Auto-hide left desktop nav for some routes (unused)
    if (HIDE_NAV_ROUTES.includes(currentPath)) {
      setDesktopNavState(false);
    }
    // Auto-enable "focus mode" for certain pages, like assessments
    const focused = FOCUS_MODE_ROUTES.find(
      ({ route }) => route === currentPath
    );
    if (focused) {
      // Default path that to go "back" to when exiting focus mode
      setFocusMode(focused.defaultReturnPath);
      setDesktopNavState(false);
    } else {
      setFocusMode(undefined);
    }
  }, [currentPath]);

  // Expand desktop nav if specified in location state. This supports re-expanding
  // the nav when navigating back from a page that auto-collapsed it.
  useEffect(() => {
    if (state?.[EXPAND_DESKTOP_NAV_KEY]) {
      setDesktopNavState(true);
    }
  }, [state]);

  const handleCloseDesktopMenu = useCallback(() => {
    setDesktopNavState(false);
  }, []);
  const handleOpenDesktopMenu = useCallback(() => {
    setDesktopNavState(true);
  }, []);

  const noPadding = useMemo(
    () => NO_PADDING_ROUTES.includes(currentPath || ''),
    [currentPath]
  );

  return {
    currentPath,
    focusMode, // Auto-hide left nav when the page is opened (like assessments)
    noPadding, // Remove default padding from DashboardContentContainer (like form builder)
    desktopNavIsOpen,
    mobileNavIsOpen,
    handleCloseMobileMenu,
    handleOpenMobileMenu,
    handleCloseDesktopMenu,
    handleOpenDesktopMenu,
  };
}
