export type AuthMethod = 'devise' | 'jwt';

// 'devise' names the Devise/Okta login form, not password auth: <Login /> renders
// the Okta button inside it via oktaPath.
//
// Every unrecognized value collapses to 'devise' rather than raising, so that
// routing (Login vs PublicLanding) and session keepalive (POST+CSRF vs GET) can
// never read the same unknown value two different ways.
export const resolveAuthMethod = (authMethod?: string): AuthMethod =>
  authMethod === 'jwt' ? 'jwt' : 'devise';
