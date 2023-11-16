import { createContext } from 'react';

import { HmisUser } from '@/modules/auth/api/sessions';

export interface HmisAuthState {
  user?: HmisUser;
  setUser: (user: HmisUser | undefined) => void;
  logoutUser: VoidFunction;
  impersonateUser: (userId: string) => void;
}

const initialState: HmisAuthState = {
  user: undefined,
  setUser: () => undefined,
  logoutUser: () => undefined,
  impersonateUser: () => undefined,
};
export const HmisAuthContext = createContext(initialState);
