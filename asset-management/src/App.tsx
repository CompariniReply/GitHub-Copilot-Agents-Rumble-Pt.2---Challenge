import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoginPage } from "@/features/auth/LoginPage";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { UsersPage } from "@/features/users/UsersPage";
import { CatalogPage } from "@/features/assets/CatalogPage";
import { SettingsPage } from "@/features/settings/SettingsPage";

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
        }
      />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/catalogo" element={<CatalogPage />} />
        <Route path="/utenti" element={<UsersPage />} />
        <Route
          path="/settings"
          element={
            <ProtectedRoute requiredPermission="canAccessSettings">
              <SettingsPage />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
