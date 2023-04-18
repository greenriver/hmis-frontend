import { useContext } from 'react';

import { HmisAppSettingsContext } from './Context';

export const useHmisAppSettings = () => {
  return useContext(HmisAppSettingsContext);
};
