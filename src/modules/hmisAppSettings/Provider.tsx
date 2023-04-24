import { ReactNode, useEffect, useState } from 'react';

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
  useEffect(() => {
    const controller = new AbortController();
    fetchHmisAppSettings().then(setFetched).catch(setError);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (fetched?.appName) document.title = fetched.appName;
  }, [fetched]);

  if (error) throw error;
  if (!fetched) return <Loading />;

  return (
    <HmisAppSettingsContext.Provider value={fetched}>
      {children}
    </HmisAppSettingsContext.Provider>
  );
};
