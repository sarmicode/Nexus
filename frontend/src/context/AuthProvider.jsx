import { useCallback, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/auth';
import { getMe, updateMe } from '../services/users';
import { tokenStorage } from '../utils/tokenStorage';
import { AuthContext } from './AuthContext';
import { UserContext } from './UserContext';

/**
 * AuthProvider — session lifecycle (Phase 01):
 * - restores the session on load (getMe; the axios interceptor silently
 *   refreshes an expired access token first),
 * - login / register (auto-login — the backend returns tokens),
 * - logout (server-side token wipe + local clear),
 * - listens for `fb:logout` (dispatched by the interceptor when a refresh fails).
 */
export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthed, setIsAuthed] = useState(Boolean(tokenStorage.access));
  const [initializing, setInitializing] = useState(Boolean(tokenStorage.access));

  // Restore session on load (if we hold an access token).
  useEffect(() => {
    let cancelled = false;
    if (!tokenStorage.access) return undefined;
    getMe()
      .then((profile) => {
        if (!cancelled) setUser(profile);
      })
      .catch(() => {
        // 401 → interceptor already attempted a silent refresh; still failing
        // means the session is dead.
        if (cancelled) return;
        tokenStorage.clear();
        setIsAuthed(false);
        setUser(null);
      })
      .finally(() => {
        if (!cancelled) setInitializing(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // The axios interceptor dispatches this when the silent refresh fails.
  useEffect(() => {
    const onForcedLogout = () => {
      tokenStorage.clear();
      setUser(null);
      setIsAuthed(false);
      setInitializing(false);
    };
    window.addEventListener('fb:logout', onForcedLogout);
    return () => window.removeEventListener('fb:logout', onForcedLogout);
  }, []);

  const login = useCallback(async (credentials) => {
    const profile = await authService.login(credentials);
    setUser(profile);
    setIsAuthed(true);
    setInitializing(false);
    return profile;
  }, []);

  const register = useCallback(async (payload) => {
    const profile = await authService.register(payload);
    setUser(profile);
    setIsAuthed(true);
    setInitializing(false);
    return profile;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setIsAuthed(false);
  }, []);

  const updateUser = useCallback(async (patch) => {
    const profile = await updateMe(patch);
    setUser(profile);
    return profile;
  }, []);

  const authValue = useMemo(
    () => ({ isAuthed, initializing, role: user?.role, login, register, logout }),
    [isAuthed, initializing, user, login, register, logout]
  );
  const userValue = useMemo(() => ({ user, setUser, updateUser }), [user, updateUser]);

  return (
    <AuthContext.Provider value={authValue}>
      <UserContext.Provider value={userValue}>{children}</UserContext.Provider>
    </AuthContext.Provider>
  );
}
