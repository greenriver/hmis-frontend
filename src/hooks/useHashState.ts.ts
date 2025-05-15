import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface UseHashStateParams {
  initial: string;
  skip?: boolean;
  clearSearch?: boolean;
}

const useHashState = ({
  initial,
  skip,
  clearSearch,
}: UseHashStateParams): [string, (newValue: string) => void] => {
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (skip) return;
    // If no hash is present on the path, set it to initial
    if (!hash) {
      navigate({ pathname, search, hash: initial }, { replace: true });
    }
  }, [hash, pathname, search, navigate, initial, skip]);

  const hashValue = useMemo(() => hash.replace(/^#/, ''), [hash]);

  return [
    hashValue,
    (newValue: string) => {
      if (newValue === hash) return;
      navigate(
        {
          pathname,
          search: clearSearch ? undefined : search,
          hash: newValue,
        },
        { replace: false }
      );
    },
  ];
};

export default useHashState;
