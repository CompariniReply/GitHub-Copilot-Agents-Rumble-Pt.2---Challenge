import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UserDropdown } from "@/components/ui/dropdown-menu";
import {
  Monitor,
  LayoutDashboard,
  Package,
  Users,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

export function AppLayout() {
  const { user, permissions } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect da rotte protette per Viewer
  useEffect(() => {
    if (!permissions.canAccessSettings && location.pathname === "/settings") {
      navigate("/", { replace: true });
    }
  }, [location.pathname, permissions.canAccessSettings, navigate]);

  const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard", show: true },
    { to: "/catalogo", icon: Package, label: "Catalogo", show: permissions.canViewCatalog },
    { to: "/utenti", icon: Users, label: "Utenti", show: true },
    { to: "/settings", icon: Settings, label: "Impostazioni", show: permissions.canAccessSettings },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Monitor className="h-6 w-6 text-sidebar-primary" />
          <span className="font-semibold text-sidebar-foreground">Asset Manager</span>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          {navItems
            .filter((item) => item.show)
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  }`
                }
                end={item.to === "/"}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
        </nav>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b px-4 lg:px-6">
          <button
            className="lg:hidden p-2 hover:bg-accent rounded-md cursor-pointer"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex items-center gap-2">
            {user && (
              <Badge variant="outline" className="hidden sm:inline-flex">
                {user.ruolo}
              </Badge>
            )}
          </div>
          <UserDropdown />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
