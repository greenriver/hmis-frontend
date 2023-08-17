import { createContext } from 'react';

import { HmisUser } from '@/modules/auth/api/sessions';

export interface HmisAuthState {
  user?: HmisUser;
  setUser: (user: HmisUser | undefined) => void;
}

const initialState: HmisAuthState = {
  user: undefined,
  setUser: () => undefined,
};
export const HmisAuthContext = createContext(initialState);
