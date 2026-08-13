import { HMIS_REMOTE_SESSION_UID_EVENT } from '@/modules/auth/api/constants';

export const dispatchSessionTrackingEvent = (userId: string | undefined) => {
  document.dispatchEvent(
    new CustomEvent(HMIS_REMOTE_SESSION_UID_EVENT, { detail: userId })
  );
};

// The account states re-authenticating cannot clear
// (jwt_hmis_current_user.rb#terminal_account_error). Sending them down the 401
// session-ended path returns the user to a sign-in screen that lands them back here.
export type TerminalAccountErrorType =
  | 'account_deactivated'
  | 'no_warehouse_account';

const TERMINAL_ACCOUNT_ERROR_TYPES: TerminalAccountErrorType[] = [
  'account_deactivated',
  'no_warehouse_account',
];

export const isTerminalAccountErrorType = (
  value: unknown
): value is TerminalAccountErrorType =>
  typeof value === 'string' &&
  (TERMINAL_ACCOUNT_ERROR_TYPES as string[]).includes(value);
