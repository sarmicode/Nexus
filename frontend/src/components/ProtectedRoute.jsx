import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — redirects to /login (remembering the target) when the
 * visitor is not signed in; shows a brief "restoring session" state while
 * the initial getMe()/refresh round-trip is in flight.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthed, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return (
      <div className="card" role="status">
        ⏳ Restoring your session…
      </div>
    );
  }
  if (!isAuthed) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
}
