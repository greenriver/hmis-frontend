import { createContext } from 'react';

import { HmisAppSettings } from './types';

const initialState: HmisAppSettings = {};
export const HmisAppSettingsContext = createContext(initialState);
