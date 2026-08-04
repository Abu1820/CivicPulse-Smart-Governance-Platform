import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, role }) {
  const storedUser = localStorage.getItem("user");
  const token = localStorage.getItem("token");

  let user = null;

  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Invalid user session in localStorage", error);
  }

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;