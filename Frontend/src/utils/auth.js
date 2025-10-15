const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

function setCookie(name, value, days) {
  try {
    let expires = '';
    if (days) {
      const d = new Date();
      d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
      expires = '; expires=' + d.toUTCString();
    }
    document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/';
  } catch {}
}

function getCookie(name) {
  try {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  } catch { return null; }
}

function deleteCookie(name) {
  try {
    document.cookie = name + '=; Max-Age=0; path=/';
  } catch {}
}

export function saveAuth(token, user) {
  try {
    if (token) setCookie(TOKEN_KEY, token, 7);
    if (user) setCookie(USER_KEY, JSON.stringify(user), 7);
  } catch {}
}

export function clearAuth() {
  try {
    deleteCookie(TOKEN_KEY);
    deleteCookie(USER_KEY);
  } catch {}
}

export function getAuthToken() {
  try {
    return getCookie(TOKEN_KEY);
  } catch { return null; }
}

export function getAuthUser() {
  try {
    const s = getCookie(USER_KEY);
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

// Apply token from cookie at startup
// Note: axios instance attaches Authorization header per-request from cookie.

export default { saveAuth, clearAuth, getAuthToken, getAuthUser };
