import { RefObject, useEffect, useMemo, useState } from 'react';

const useElementInView = (
  ref: RefObject<Element | undefined>,
  rootMargin: string
) => {
  const [isVisible, setIsVisible] = useState(false);

  const observer = useMemo(
    () =>
      new IntersectionObserver(
        ([entry]) => setIsVisible(entry.isIntersecting),
        { rootMargin }
      ),
    [rootMargin]
  );

  useEffect(() => {
    if (!ref || !ref.current) return;

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, observer]);

  return isVisible;
};

export default useElementInView;
