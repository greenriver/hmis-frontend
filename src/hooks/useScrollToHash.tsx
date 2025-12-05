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

  // Move focus to the section for keyboard navigation and screen readers
  // First make the element focusable (same approach as SkipToContentButton)
  if (!element.hasAttribute('tabindex')) {
    element.setAttribute('tabindex', '-1');
  }
  element.focus({ preventScroll: true }); // We already smooth-scrolled to it
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
