import { useContext, useEffect } from "react";
import { Outlet } from "react-router-dom";

import { AuthContext } from "../AuthContext";

const CORE_LOGIN_URL = "http://localhost:5173/login";

export default function ProtectedRoute() {
  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error("ProtectedRoute must be used within AuthProvider.");
  }

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      window.location.replace(CORE_LOGIN_URL);
    }
  }, [auth.isLoading, auth.isAuthenticated]);

  if (auth.isLoading || !auth.isAuthenticated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Redirecting to RetailFlow SaaS...
      </div>
    );
  }

  return <Outlet />;
}
