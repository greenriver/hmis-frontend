import { useContext } from 'react';

import { HmisAuthContext } from '../AuthContext';

export default function useAuth() {
  return useContext(HmisAuthContext);
}
