import { createContext, useContext } from 'react';

/**
 * AuthContext — session state (isAuthed, initializing, role) + actions
 * (login, register, logout). Provided by <AuthProvider> (AuthProvider.jsx).
 */
export const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
