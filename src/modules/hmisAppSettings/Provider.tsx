import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { fetchHmisAppSettings } from './api';
import { HmisAppSettingsContext } from './Context';
import { HmisAppSettings } from './types';

import Loading from '@/components/elements/Loading';

interface Props {
  children: ReactNode;
}
export const HmisAppSettingsProvider: React.FC<Props> = ({ children }) => {
  // TODO: use browser storage, don't need to fetch on each page load
  const [fetched, setFetched] = useState<HmisAppSettings>();
  const [error, setError] = useState<Error>();
  const navigate = useNavigate();
  useEffect(() => {
    const controller = new AbortController();
    fetchHmisAppSettings().then(setFetched).catch(setError);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (fetched?.appName) document.title = fetched.appName;
  }, [fetched]);

  useEffect(() => {
    if (error) {
      const cause = error?.cause as any;
      if (cause?.error?.type === 'timeout') {
        // Refetch settings if the session timed out
        fetchHmisAppSettings().then(setFetched).catch(setError);
        navigate('/', {
          state: { clearPrev: true },
          replace: true,
        });
      } else {
        throw error;
      }
    }
  }, [error, navigate]);

  if (!fetched) return <Loading />;

  return (
    <HmisAppSettingsContext.Provider value={fetched}>
      {children}
    </HmisAppSettingsContext.Provider>
  );
};
