import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useScrollToHash(pageLoading?: boolean, offset?: number) {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    if (!hash || pageLoading) return;

    setTimeout(() => {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element && offset) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      } else if (element) {
        element.scrollIntoView();
      }
    }, 0);
  }, [pathname, hash, key, pageLoading, offset]);
}
