import { useContext } from 'react';

import { HmisAppSettingsContext } from './Context';
import { HmisAppSettings } from './types';

export const useHmisAppSettings = (): HmisAppSettings => {
  return useContext(HmisAppSettingsContext);
};

// 'devise' names the Devise/Okta login form, not password auth: <Login /> renders
// the Okta button inside it via oktaPath.
//
// Every unrecognized value collapses to 'devise' rather than raising, so that
// routing (Login vs PublicLanding) and session keepalive (POST+CSRF vs GET) can
// never read the same unknown value two different ways.
//
// Pure (no hook/storage deps) so it can be reused outside React - see getAuthMethod.
export const resolveAuthMethod = (
  authMethod?: HmisAppSettings['authMethod']
): 'devise' | 'jwt' => (authMethod === 'jwt' ? 'jwt' : 'devise');

export const useAuthMethod = (): 'devise' | 'jwt' =>
  resolveAuthMethod(useHmisAppSettings().authMethod);
