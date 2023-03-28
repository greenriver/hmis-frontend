import { ReactNode, useEffect, useState } from 'react';

import { fetchHmisAppSettings } from './api';
import { HmisAppSettingsContext } from './Context';
import { HmisAppSettings } from './types';

import Loading from '@/components/elements/Loading';

interface Props {
  children: ReactNode;
}
export const HmisAppSettingsProvider: React.FC<Props> = ({ children }) => {
  const [fetched, setFetched] = useState<HmisAppSettings>();
  useEffect(() => {
    const controller = new AbortController();
    fetchHmisAppSettings().then(setFetched);
    return () => controller.abort();
  }, []);
  if (!fetched) {
    return <Loading />;
  }
  return (
    <HmisAppSettingsContext.Provider value={fetched}>
      {children}
    </HmisAppSettingsContext.Provider>
  );
};
