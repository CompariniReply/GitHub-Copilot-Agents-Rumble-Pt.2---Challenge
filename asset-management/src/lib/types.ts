export type UserRole = "Admin" | "Manager" | "Viewer";

export interface User {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  reparto: string;
  sede: string;
  ruolo: UserRole;
  password: string;
}

export interface Department {
  id: string;
  nome: string;
  sede: string;
  responsabile: string;
  numDipendenti: number;
}

export type AssetStatus = "In uso" | "Disponibile" | "In manutenzione" | "Dismesso";

export type AssetCategory =
  | "Laptop"
  | "Monitor"
  | "Smartphone"
  | "Tablet"
  | "Stampanti"
  | "Server"
  | "Accessori IT"
  | "Dispositivi di Rete";

export interface Asset {
  id: string;
  nome: string;
  categoria: AssetCategory;
  marca: string;
  modello: string;
  numeroSeriale: string;
  dataAcquisto: string;
  costo: number;
  garanziaMesi: number;
  stato: AssetStatus;
  assegnatoA: string | null;
  reparto: string | null;
  ubicazione?: string;
  note?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface RolePermissions {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canAssign: boolean;
  canManageUsers: boolean;
  canAccessSettings: boolean;
  canViewDashboard: boolean;
  canViewCatalog: boolean;
  canViewReports: boolean;
}
