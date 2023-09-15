import { createContext } from 'react';

import { HmisUser } from '@/modules/auth/api/sessions';

export interface HmisAuthState {
  user?: HmisUser;
  setUser: (user: HmisUser | undefined) => void;
  logoutUser: VoidFunction;
}

const initialState: HmisAuthState = {
  user: undefined,
  setUser: () => undefined,
  logoutUser: () => undefined,
};
export const HmisAuthContext = createContext(initialState);
