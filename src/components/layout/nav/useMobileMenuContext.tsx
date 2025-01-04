import { useCallback, useState } from 'react';
import { useOutletContext } from 'react-router-dom';

export type MobileMenuContext = {
  mobileNavIsOpen: boolean;
  handleCloseMobileMenu: VoidFunction;
  handleOpenMobileMenu: VoidFunction;
};

export const useMobileMenuContext = (): MobileMenuContext => {
  const [mobileNavIsOpen, setMobileNavState] = useState(false);
  const handleCloseMobileMenu = useCallback(() => {
    setMobileNavState(false);
  }, []);
  const handleOpenMobileMenu = useCallback(() => {
    setMobileNavState(true);
  }, []);

  return { mobileNavIsOpen, handleCloseMobileMenu, handleOpenMobileMenu };
};

export function useMobileMenu() {
  return useOutletContext<MobileMenuContext>();
}
