import { createContext } from 'react';

import { HmisAppSettings } from './types';

const initialState: HmisAppSettings | null = null;
export const HmisAppSettingsContext = createContext<HmisAppSettings | null>(
  initialState
);
