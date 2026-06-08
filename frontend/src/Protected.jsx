import { Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

export default function Protected({ children, allowedRoles }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="text-center">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Verifying session…</span>
          </div>
          <p className="mt-3 text-muted">Verifying session…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/not-allowed" replace />;
  }

  return children;
}
