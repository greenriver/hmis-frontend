export function readCookie(cookieName: string) {
  const name = cookieName + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return decodeURIComponent(c.substring(name.length, c.length));
    }
  }
  return '';
}

export function setCookie(name: string, value: string) {
  // Set the cookie with the desired name, value, and expiration time
  document.cookie = `${name}=${value}; Secure`;
}
