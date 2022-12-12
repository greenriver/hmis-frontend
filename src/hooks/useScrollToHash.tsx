import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useScrollToHash(pageLoading?: boolean) {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    if (!hash || pageLoading) return;

    setTimeout(() => {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView();
      }
    }, 0);
  }, [pathname, hash, key, pageLoading]);
}
