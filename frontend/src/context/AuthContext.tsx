import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { fetchMe, login as loginRequest } from "@/api/auth";
import { registerAuthFailureHandler, tokenStorage } from "@/api/client";
import type { CurrentUser } from "@/types";

interface AuthContextValue {
  user: CurrentUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (code: string) => boolean;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  useEffect(() => {
    registerAuthFailureHandler(logout);
  }, [logout]);

  useEffect(() => {
    async function bootstrap() {
      if (!tokenStorage.getAccess()) {
        setIsLoading(false);
        return;
      }
      try {
        const me = await fetchMe();
        setUser(me);
      } catch {
        tokenStorage.clear();
      } finally {
        setIsLoading(false);
      }
    }
    bootstrap();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const response = await loginRequest(username, password);
    tokenStorage.set(response.access, response.refresh);
    setUser(response.user);
  }, []);

  const hasPermission = useCallback(
    (code: string) => Boolean(user?.is_superuser || user?.permissions.includes(code)),
    [user],
  );

  const value = useMemo(
    () => ({ user, isLoading, isAuthenticated: Boolean(user), login, logout, hasPermission }),
    [user, isLoading, login, logout, hasPermission],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
