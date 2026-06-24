import type { AssetCategory, AssetStatus } from "./types";

/**
 * Helper di dominio e formattazione già pronti per le challenge.
 * Usali liberamente in Catalogo, Dashboard e Report per evitare di
 * riscrivere costanti, formattazioni e mapping degli stati.
 */

/** Tutte le categorie asset (allineate a `AssetCategory` in types.ts). */
export const ASSET_CATEGORIES: AssetCategory[] = [
  "Laptop",
  "Monitor",
  "Smartphone",
  "Tablet",
  "Stampanti",
  "Server",
  "Accessori IT",
  "Dispositivi di Rete",
];

/** Tutti gli stati possibili di un asset (allineati a `AssetStatus`). */
export const ASSET_STATUSES: AssetStatus[] = [
  "In uso",
  "Disponibile",
  "In manutenzione",
  "Dismesso",
];

/**
 * Marche disponibili per categoria — utile per popolare la select "Marca"
 * del form "Nuovo Asset" filtrandola in base alla categoria scelta.
 */
export const BRANDS_BY_CATEGORY: Record<AssetCategory, string[]> = {
  Laptop: ["Apple", "Dell", "Lenovo", "HP", "Asus"],
  Monitor: ["Dell", "LG", "Samsung", "BenQ"],
  Smartphone: ["Apple", "Samsung"],
  Tablet: ["Apple", "Samsung"],
  Stampanti: ["HP", "Epson", "Brother"],
  Server: ["Dell", "HPE"],
  "Accessori IT": ["CalDigit", "Logitech", "Sony"],
  "Dispositivi di Rete": ["Cisco", "Ubiquiti"],
};

/** Variante del componente `Badge` consigliata per ciascuno stato. */
type BadgeVariant = "success" | "info" | "warning" | "secondary";

export const STATUS_BADGE_VARIANT: Record<AssetStatus, BadgeVariant> = {
  Disponibile: "success",
  "In uso": "info",
  "In manutenzione": "warning",
  Dismesso: "secondary",
};

export function getStatusBadgeVariant(stato: AssetStatus): BadgeVariant {
  return STATUS_BADGE_VARIANT[stato];
}

/** Colore esadecimale per ciascuno stato — utile per i grafici. */
export const STATUS_COLORS: Record<AssetStatus, string> = {
  "In uso": "#3b82f6",
  Disponibile: "#10b981",
  "In manutenzione": "#f59e0b",
  Dismesso: "#94a3b8",
};

/** Palette di colori riutilizzabile per categorie/serie nei grafici. */
export const CHART_PALETTE: string[] = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#f43f5e",
  "#84cc16",
];

const currencyFormatter = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

/** Formatta un importo in euro, es. `1299` → `1.299 €`. */
export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

/**
 * Converte una data in formato `GG/MM/AAAA` (come nei dati mock) in un
 * oggetto `Date`, utile per ordinamenti e confronti.
 */
export function parseDate(ddmmyyyy: string): Date {
  const [day, month, year] = ddmmyyyy.split("/").map(Number);
  return new Date(year, month - 1, day);
}

/** Normalizza una data (`Date` o stringa) nel formato `GG/MM/AAAA`. */
export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? parseDate(value) : value;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}
