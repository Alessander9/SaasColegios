/**
 * Cookie Utilities for Secure Client-Side Session Persistence
 */

export interface CookieOptions {
  days?: number;
  minutes?: number;
  seconds?: number;
  path?: string;
  sameSite?: 'Strict' | 'Lax' | 'None';
  secure?: boolean;
}

export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  if (typeof document === 'undefined') return;

  const {
    days,
    minutes,
    seconds,
    path = '/',
    sameSite = 'Lax',
    secure = false,
  } = options;

  let expires = '';

  if (days || minutes || seconds) {
    const date = new Date();
    let totalMs = 0;
    if (days) totalMs += days * 24 * 60 * 60 * 1000;
    if (minutes) totalMs += minutes * 60 * 1000;
    if (seconds) totalMs += seconds * 1000;
    date.setTime(date.getTime() + totalMs);
    expires = `; expires=${date.toUTCString()}`;
  }

  const secureFlag = secure || (typeof window !== 'undefined' && window.location.protocol === 'https:') ? '; Secure' : '';
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}${expires}; path=${path}; SameSite=${sameSite}${secureFlag}`;
}

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const nameEQ = `${encodeURIComponent(name)}=`;
  const cookies = document.cookie.split(';');

  for (let i = 0; i < cookies.length; i++) {
    let c = cookies[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      try {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      } catch {
        return c.substring(nameEQ.length, c.length);
      }
    }
  }

  return null;
}

export function deleteCookie(name: string, path = '/'): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; SameSite=Lax`;
}
