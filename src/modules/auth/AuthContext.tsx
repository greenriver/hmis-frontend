import { createContext } from 'react';

import { HmisAuthState } from '../hmisAppSettings/types';

const initialState: HmisAuthState = {
  user: undefined,
  setUser: () => undefined,
};
export const HmisAuthContext = createContext(initialState);
