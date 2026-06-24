import { useState, useRef, useEffect, type ReactNode } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface DropdownMenuProps {
  children: ReactNode;
}

export function UserDropdown() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors cursor-pointer"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
          {user.nome[0]}{user.cognome[0]}
        </div>
        <span className="hidden md:inline">{user.nome} {user.cognome}</span>
        <ChevronDown className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 rounded-md border bg-popover p-1 shadow-md z-50">
          <div className="px-3 py-2 border-b mb-1">
            <p className="text-sm font-medium">{user.nome} {user.cognome}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Ruolo: {user.ruolo} · {user.reparto}</p>
          </div>
          <button
            onClick={() => { logout(); setOpen(false); }}
            className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm text-destructive hover:bg-accent transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Esci
          </button>
        </div>
      )}
    </div>
  );
}

export { type DropdownMenuProps };
