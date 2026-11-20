import { useEffect, useState } from "react";

import { AuthContext } from "./AuthContext";
import { coreAuthService } from "../../services/core-api/coreAuthService";

let sessionRestorePromise = null;

function getAccessToken(response) {
  return (
    response?.data?.tokens?.accessToken ??
    response?.data?.accessToken ??
    response?.accessToken ??
    null
  );
}

function getUserData(response) {
  return response?.data ?? response ?? null;
}

function restoreSession() {
  if (!sessionRestorePromise) {
    sessionRestorePromise = (async () => {
      const refreshResponse = await coreAuthService.refresh();
      const accessToken = getAccessToken(refreshResponse);

      if (!accessToken) {
        throw new Error("Session restoration failed.");
      }

      const userResponse = await coreAuthService.getCurrentUser(accessToken);
      const user = getUserData(userResponse);

      if (!user) {
        throw new Error("Unable to retrieve authenticated user.");
      }

      return { accessToken, user };
    })().finally(() => {
      sessionRestorePromise = null;
    });
  }

  return sessionRestorePromise;
}

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    restoreSession()
      .then(({ accessToken: restoredToken, user: restoredUser }) => {
        if (!isMounted) return;

        setAccessToken(restoredToken);
        setUser(restoredUser);
      })
      .catch(() => {
        if (!isMounted) return;

        setAccessToken(null);
        setUser(null);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  function setAuthenticatedSession(token, authenticatedUser) {
    setAccessToken(token);
    setUser(authenticatedUser);
  }

  function clearAuthenticatedSession() {
    setAccessToken(null);
    setUser(null);
  }

  const value = {
    accessToken,
    user,
    isLoading,
    isAuthenticated: Boolean(accessToken && user),
    setAuthenticatedSession,
    clearAuthenticatedSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
