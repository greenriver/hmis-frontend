import { first } from 'lodash-es';
import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const useHashNavigation = (options: string[], defaultOption?: string) => {
  const { hash } = useLocation();
  const navigate = useNavigate();

  const hashPath = useMemo(() => {
    const cleaned = hash?.replace(/^#/, '');
    const fallback = defaultOption || first(options) || '';

    if (!cleaned) return fallback;

    const match = options.find((option) => option.match(new RegExp(cleaned)));
    if (match) return match;

    return fallback;
  }, [hash, defaultOption, options]);

  const setHash = useCallback(
    (newValue: string) => {
      navigate(`${window.location.pathname}#${newValue}`);
    },
    [navigate]
  );

  return useMemo(() => [hashPath, setHash] as const, [hashPath, setHash]);
};

export default useHashNavigation;
