import { readCookie, setCookie } from '@/utils/cookies';

const SESSION_ID = 'LocalSessionId';
function resetCurrentSessionId() {
  const ts = `ts${new Date().getTime()}`;
  setCookie(SESSION_ID, ts);
  return ts;
}

export function getCurrentSessionId() {
  const current = readCookie(SESSION_ID);
  return current || resetCurrentSessionId();
}
