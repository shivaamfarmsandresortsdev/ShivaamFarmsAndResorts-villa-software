import { Navigate } from "react-router-dom";

export default function Protected({ children }) {
  const loggedIn = localStorage.getItem("loggedIn");

  return loggedIn ? children : <Navigate to="/login" />;
}
