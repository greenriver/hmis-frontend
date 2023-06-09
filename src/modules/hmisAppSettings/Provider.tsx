import { ReactNode, useCallback, useEffect, useState } from 'react';
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

  const fetchAppSettings = useCallback(() => {
    fetchHmisAppSettings()
      .then((resp) => {
        setFetched(resp);
        setError(undefined);
      })
      .catch(setError);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchAppSettings();
    return () => controller.abort();
  }, [fetchAppSettings]);

  useEffect(() => {
    if (fetched?.appName) document.title = fetched.appName;
  }, [fetched]);

  useEffect(() => {
    if (!error) return;
    const cause = error?.cause as any;
    // Refetch settings if the session timed out
    if (cause?.error?.type === 'timeout') {
      fetchAppSettings();
      navigate('/', { state: { clearPrev: true }, replace: true });
    } else {
      // If some other error happened, reload
      window.location.reload();
    }
  }, [error, fetchAppSettings, navigate]);

  if (!fetched) return <Loading />;

  return (
    <HmisAppSettingsContext.Provider value={fetched}>
      {children}
    </HmisAppSettingsContext.Provider>
  );
};
