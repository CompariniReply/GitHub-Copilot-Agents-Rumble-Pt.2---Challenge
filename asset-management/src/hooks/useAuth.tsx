import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { User, UserRole, RolePermissions } from "@/lib/types";
import { mockUsers, rolePermissions } from "@/lib/mock-data";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  permissions: RolePermissions;
  hasRole: (role: UserRole) => boolean;
}

const defaultPermissions: RolePermissions = {
  canCreate: false,
  canEdit: false,
  canDelete: false,
  canAssign: false,
  canManageUsers: false,
  canAccessSettings: false,
  canViewDashboard: false,
  canViewCatalog: false,
  canViewReports: false,
};

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minuti

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = sessionStorage.getItem("auth_user");
    if (!stored) return null;
    const parsed = JSON.parse(stored) as { user: User; timestamp: number };
    if (Date.now() - parsed.timestamp > SESSION_TIMEOUT_MS) {
      sessionStorage.removeItem("auth_user");
      return null;
    }
    return parsed.user;
  });

  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    if (!user) return;

    const checkSession = () => {
      const stored = sessionStorage.getItem("auth_user");
      if (!stored) return;
      const parsed = JSON.parse(stored) as { timestamp: number };
      if (Date.now() - parsed.timestamp > SESSION_TIMEOUT_MS) {
        setUser(null);
        sessionStorage.removeItem("auth_user");
        setSessionExpired(true);
      }
    };

    const interval = setInterval(checkSession, 60_000);
    return () => clearInterval(interval);
  }, [user]);

  const login = useCallback((email: string, password: string) => {
    const found = mockUsers.find(
      (u) => u.email === email && u.password === password
    );
    if (!found) {
      return { success: false, error: "Credenziali non valide. Riprova." };
    }
    setUser(found);
    setSessionExpired(false);
    sessionStorage.setItem(
      "auth_user",
      JSON.stringify({ user: found, timestamp: Date.now() })
    );
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem("auth_user");
  }, []);

  const permissions = user ? rolePermissions[user.ruolo] : defaultPermissions;

  const hasRole = useCallback(
    (role: UserRole) => user?.ruolo === role,
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        permissions,
        hasRole,
      }}
    >
      {sessionExpired && !user ? (
        <SessionExpiredWrapper onClear={() => setSessionExpired(false)}>
          {children}
        </SessionExpiredWrapper>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

function SessionExpiredWrapper({
  children,
  onClear,
}: {
  children: ReactNode;
  onClear: () => void;
}) {
  useEffect(() => {
    onClear();
  }, [onClear]);
  return <>{children}</>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
