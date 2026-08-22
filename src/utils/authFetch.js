// Client-side counterpart to utils/requireAuth: attaches the signed-in user's
// Firebase ID token to a request to one of the protected admin API routes.
//
// getIdToken() returns the cached token and refreshes it automatically when it
// is close to expiring, so this is safe to call on every request.
import { auth } from '../firebase';

export async function authFetch(url, options = {}) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('You are signed out. Reload the page and sign in again.');
  }

  const token = await user.getIdToken();
  const headers = { ...(options.headers || {}), Authorization: `Bearer ${token}` };

  const res = await fetch(url, { ...options, headers });
  if (res.status === 401 || res.status === 403) {
    throw new Error(
      res.status === 403
        ? 'Your account is not an administrator.'
        : 'Your session has expired. Sign in again.'
    );
  }
  return res;
}

export default authFetch;
