import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { homePath } from "../api.js";

export default function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="container"><p>Loading...</p></div>;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={homePath(user.role)} replace />;
  return children;
}
