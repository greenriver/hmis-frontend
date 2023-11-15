import { ReactNode, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PathHandler = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const { pathname, hash, search } = location;
  const match = pathname.match(/^(.*)(%20)+$/);

  useEffect(() => {
    if (match) {
      const [, corrected] = match;
      navigate({ pathname: corrected, hash, search }, { replace: true });
    }

    // ignore pathname dependency, we only want to run this once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Prevent mounting the children if still trying to redirect
  if (match) return null;

  return children;
};

export default PathHandler;
