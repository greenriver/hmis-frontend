import { readCookie } from '@/utils/cookies';

export function getCsrfToken() {
  return readCookie('CSRF-Token');
}
