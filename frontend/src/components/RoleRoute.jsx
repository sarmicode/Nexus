import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

/**
 * RoleRoute — renders children only when the signed-in user has one of the
 * allowed roles, otherwise redirects. (Used for admin pages from Phase 07 on.)
 *
 *   <RoleRoute roles={['admin']}>…</RoleRoute>
 */
export default function RoleRoute({ roles, children, fallbackTo = '/' }) {
  const { user } = useUser();
  if (!user || !roles.includes(user.role)) {
    return <Navigate to={fallbackTo} replace />;
  }
  return children;
}
