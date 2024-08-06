import { useCallback, useEffect, useState } from 'react';
import useCurrentPath from './useCurrentPath';
import { useMobileMenu } from '@/components/layout/nav/useMobileMenuContext';
import { FOCUS_MODE_ROUTES, HIDE_NAV_ROUTES } from '@/routes/routes';

export function useDashboardState() {
  const currentPath = useCurrentPath();

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

  const handleCloseDesktopMenu = useCallback(() => {
    setDesktopNavState(false);
  }, []);
  const handleOpenDesktopMenu = useCallback(() => {
    setDesktopNavState(true);
  }, []);

  return {
    currentPath,
    focusMode,
    desktopNavIsOpen,
    mobileNavIsOpen,
    handleCloseMobileMenu,
    handleOpenMobileMenu,
    handleCloseDesktopMenu,
    handleOpenDesktopMenu,
  };
}
