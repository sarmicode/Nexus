import { createContext, useContext } from 'react';

/**
 * UserContext — the authenticated user's profile (Phase 01).
 *
 * The provider is rendered by <AuthProvider> (AuthContext.jsx), which owns
 * the user state; this file keeps the context + hook separate per the
 * "AuthContext + UserContext" scope item.
 */
export const UserContext = createContext(null);

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside <AuthProvider>');
  return ctx;
}
