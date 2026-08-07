import { useContext } from 'react';

import { HmisAppSettingsContext } from './Context';
import { HmisAppSettings } from './types';

export const useHmisAppSettings = (): HmisAppSettings => {
  return useContext(HmisAppSettingsContext);
};

// Resolves the effective auth method. The authority is the backend's `authMethod`
// from GET /hmis/app_settings (a public endpoint): it's fetched at runtime so one
// set of compiled assets can serve installations with different auth methods.
// Final fallback 'devise' keeps the existing Devise/Okta experience when nothing
// advertises a method; the JWT/SSO path is opt-in. Note 'devise' here means "the
// Devise/Okta login form" (Okta is rendered inside <Login /> via oktaPath), not
// password auth specifically. Pure (no hook/storage deps) so it can be reused
// outside React - see getAuthMethod.
//
// Only the exact string 'jwt' opts into the JWT/SSO path; any other value (unset,
// empty, or a typo like 'okta') collapses to 'devise'. This keeps every call site
// in agreement - routing (Login vs PublicLanding) and session keepalive (POST+CSRF
// vs GET) must never disagree on an unrecognized value and produce a broken hybrid.
export const resolveAuthMethod = (
  authMethod?: HmisAppSettings['authMethod']
): 'devise' | 'jwt' => (authMethod === 'jwt' ? 'jwt' : 'devise');

export const useAuthMethod = (): 'devise' | 'jwt' =>
  resolveAuthMethod(useHmisAppSettings().authMethod);
