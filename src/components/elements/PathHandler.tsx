import { ReactNode, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PathHandler = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const attempts = useRef(0);

  const { pathname, hash, search } = location;
  const match = pathname.match(/^(.*)(%20)+$/);

  useEffect(() => {
    if (attempts.current >= 5) {
      console.error(`Unable to correct route '${pathname}'`);
      return;
    }

    if (match) {
      const [, corrected] = match;
      attempts.current += 1;
      navigate({ pathname: corrected, hash, search }, { replace: true });
    }
  }, [hash, match, pathname, search, navigate]);

  // Prevent mounting the children if still trying to redirect
  if (match && attempts.current < 5) return null;

  return children;
};

export default PathHandler;
