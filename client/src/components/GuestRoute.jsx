import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // While checking auth (initial /auth/me)
  if (loading) {
    return null; // or a spinner
  }

  // If logged in → redirect away from login/signup
  if (user) {
    return (
      <Navigate
        to={location.state?.from || "/"}
        replace
      />
    );
  }

  // Not logged in → allow access
  return children;
}
