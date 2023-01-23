import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const scrollToElement = (
  element: HTMLElement | null,
  offset?: number
) => {
  if (!element) return;
  if (offset) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });
  } else {
    element.scrollIntoView();
  }
};

export function useScrollToHash(pageLoading?: boolean, offset?: number) {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    if (!hash || pageLoading) return;

    setTimeout(() => {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      scrollToElement(element, offset);
    }, 0);
  }, [pathname, hash, key, pageLoading, offset]);
}
