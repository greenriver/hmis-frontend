import {
  HMIS_ACCOUNT_ERROR_EVENT,
  HMIS_REMOTE_SESSION_UID_EVENT,
  HMIS_SESSION_REMAINING_HEADER,
  HMIS_SESSION_UID_HEADER,
} from '@/modules/auth/api/constants';

// JWT arm only. `requestedAt` is when the request started, in browser-clock seconds:
// the server reads the token early in the request, so anchoring there errs early by
// network latency rather than late by the request's run time.
export interface SessionRemaining {
  remainingSecs: number;
  requestedAt: number;
}

export type RemoteSessionDetail = {
  userId?: string;
} & Partial<SessionRemaining>;

// Fractional, unlike currentTimeInSeconds, so requests in the same second still order.
export const requestStartInSeconds = () => Date.now() / 1000;

export const dispatchSessionTrackingEvent = (
  userId: string | undefined,
  remaining?: SessionRemaining
) => {
  const detail: RemoteSessionDetail = { userId, ...remaining };
  document.dispatchEvent(
    new CustomEvent(HMIS_REMOTE_SESSION_UID_EVENT, { detail })
  );
};

// JWT arm only: undefined on the Devise arm, which doesn't send the header.
export const sessionRemainingSecsFromHeaders = (
  headers: Headers
): number | undefined => {
  const remainingSecs = parseInt(
    headers.get(HMIS_SESSION_REMAINING_HEADER) || '',
    10
  );
  return Number.isNaN(remainingSecs) ? undefined : remainingSecs;
};

export const dispatchSessionTrackingFromHeaders = (
  headers: Headers,
  requestedAt: number
) => {
  const userId = headers.get(HMIS_SESSION_UID_HEADER) || undefined;
  const remainingSecs = sessionRemainingSecsFromHeaders(headers);
  dispatchSessionTrackingEvent(
    userId,
    remainingSecs === undefined ? undefined : { remainingSecs, requestedAt }
  );
};

// The account states re-authenticating cannot clear
// (jwt_hmis_current_user.rb#terminal_account_error, Hmis::User#hmis_access_error_for).
// Sending them down the 401 session-ended path returns the user to a sign-in
// screen that lands them back here.
export type TerminalAccountErrorType =
  | 'account_deactivated'
  | 'no_warehouse_account'
  | 'no_hmis_access';

const TERMINAL_ACCOUNT_ERROR_TYPES: TerminalAccountErrorType[] = [
  'account_deactivated',
  'no_warehouse_account',
  'no_hmis_access',
];

export const isTerminalAccountErrorType = (
  value: unknown
): value is TerminalAccountErrorType =>
  typeof value === 'string' &&
  (TERMINAL_ACCOUNT_ERROR_TYPES as string[]).includes(value);

// Tells HmisAppSettingsProvider to replace the app with the terminal page for `type`.
export const dispatchAccountErrorEvent = (type: TerminalAccountErrorType) => {
  document.dispatchEvent(
    new CustomEvent(HMIS_ACCOUNT_ERROR_EVENT, { detail: type })
  );
};

// Reads `error.type` off a backend JSON error body ({ error: { type } }) when it is a
// terminal type. Duck-typed rather than importing HmisResponseError: sessions.ts
// imports this module.
export const terminalAccountErrorFromResponseBody = (
  body: unknown
): TerminalAccountErrorType | undefined => {
  if (!body || typeof body !== 'object') return undefined;
  const type = (body as { error?: { type?: unknown } }).error?.type;
  return isTerminalAccountErrorType(type) ? type : undefined;
};
