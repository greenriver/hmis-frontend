import { ReactNode, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PathHandler = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const attempts = useRef(0);

  useEffect(() => {
    const { pathname, hash, search } = location;

    if (attempts.current >= 5) {
      console.error(`Unable to correct route '${pathname}'`);
      return;
    }

    const match = pathname.match(/^(.*)(%20)+$/);
    if (match) {
      const [, corrected] = match;
      attempts.current += 1;
      navigate({ pathname: corrected, hash, search }, { replace: true });
    }
  }, [location, navigate]);

  return children;
};

export default PathHandler;
