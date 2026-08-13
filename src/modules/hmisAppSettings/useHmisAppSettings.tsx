import { useContext } from 'react';

import { AuthMethod, resolveAuthMethod } from './authMethod';
import { HmisAppSettingsContext } from './Context';
import { HmisAppSettings } from './types';

export const useHmisAppSettings = (): HmisAppSettings => {
  return useContext(HmisAppSettingsContext);
};

export const useAuthMethod = (): AuthMethod =>
  resolveAuthMethod(useHmisAppSettings().authMethod);
