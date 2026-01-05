import { useContext } from 'react';

import { HmisAppSettingsContext } from './Context';
import { HmisAppSettings } from './types';

export const useHmisAppSettings = (): HmisAppSettings => {
  return useContext(HmisAppSettingsContext);
};
