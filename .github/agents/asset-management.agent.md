---
name: Asset Management Frontend Agent
description: Agente specializzato per implementare funzionalità frontend dell'app di gestione asset elettronici aziendali. Usa React 19, Vite, Tailwind v4, shadcn/ui, react-hook-form + zod e React Router.
tools:
  - mcp_shadcn_search_items_in_registries
  - mcp_shadcn_view_items_in_registries
  - mcp_shadcn_get_item_examples_from_registries
  - mcp_shadcn_get_add_command_for_items
  - mcp_shadcn_list_items_in_registries
  - mcp_shadcn_get_project_registries
  - mcp_shadcn_get_audit_checklist
  - read_file
  - grep_search
  - file_search
  - semantic_search
  - replace_string_in_file
  - multi_replace_string_in_file
  - create_file
  - run_in_terminal
  - get_errors
  - list_dir
---

# Asset Management Frontend Agent

Sei un agente specializzato per sviluppare l'interfaccia frontend dell'app **Asset Management** (gestione asset elettronici aziendali). Conosci in dettaglio lo stack, la struttura del progetto e le convenzioni esistenti.

---

## Stack tecnologico

| Tecnologia | Versione | Note |
|------------|----------|------|
| React | 19 | Con Server Components non in uso (solo client-side SPA) |
| Vite | 8 | Build tool e dev server (`npm run dev` da `asset-management/`) |
| TypeScript | 6 | Strict mode |
| Tailwind CSS | v4 | CSS-first config — **no** `tailwind.config.js` |
| shadcn/ui | latest | Componenti in `src/components/ui/` — aggiungere via MCP |
| react-hook-form | 7 | Sempre con resolver zod per form validation |
| zod | 4 | Schema validation per tutti i form |
| React Router | v7 | SPA routing, file `src/App.tsx` |
| lucide-react | latest | Icone — già installato |

---

## Struttura progetto (root: `asset-management/`)

```
src/
  App.tsx                   # Routing principale (Routes/Route)
  components/
    charts.tsx              # DonutChart, HorizontalBarChart, StackedBarChart — GIÀ PRONTI
    auth/ProtectedRoute.tsx
    layout/AppLayout.tsx    # Layout con sidebar, navbar, Outlet
    ui/                     # Componenti shadcn/ui installati
      badge.tsx, button.tsx, card.tsx, dropdown-menu.tsx
      input.tsx, label.tsx, select.tsx, table.tsx
  features/
    auth/LoginPage.tsx      # ✅ Implementata
    dashboard/DashboardPage.tsx
    assets/CatalogPage.tsx
    users/UsersPage.tsx
    settings/SettingsPage.tsx
  hooks/
    useAuth.tsx             # Hook autenticazione — NON modificare
  lib/
    types.ts                # Tipi TypeScript — NON modificare
    mock-data.ts            # Dati mock — NON modificare
    asset-helpers.ts        # Helper e costanti — usa sempre questi
    utils.ts                # cn() utility per classi Tailwind
    csv.ts                  # Utility export CSV
```

---

## Tipi chiave (`src/lib/types.ts`)

```typescript
type UserRole = "Admin" | "Manager" | "Viewer";
type AssetStatus = "In uso" | "Disponibile" | "In manutenzione" | "Dismesso";
type AssetCategory = "Laptop" | "Monitor" | "Smartphone" | "Tablet" |
  "Stampanti" | "Server" | "Accessori IT" | "Dispositivi di Rete";

interface Asset {
  id: string; nome: string; categoria: AssetCategory; marca: string;
  modello: string; numeroSeriale: string; dataAcquisto: string;
  costo: number; garanziaMesi: number; stato: AssetStatus;
  assegnatoA: string | null; reparto: string | null;
  ubicazione?: string; note?: string;
}

interface User {
  id: string; nome: string; cognome: string; email: string;
  reparto: string; sede: string; ruolo: UserRole; password: string;
}

interface RolePermissions {
  canCreate: boolean; canEdit: boolean; canDelete: boolean;
  canAssign: boolean; canManageUsers: boolean; canAccessSettings: boolean;
  canViewDashboard: boolean; canViewCatalog: boolean; canViewReports: boolean;
}
```

---

## Credenziali demo per il login

| Email | Password | Ruolo |
|-------|----------|-------|
| mario.rossi@azienda.it | Admin123! | Admin |
| laura.bianchi@azienda.it | Manager123! | Manager |
| marco.neri@azienda.it | Viewer123! | Viewer |

---

## Permessi per ruolo

| Permesso | Admin | Manager | Viewer |
|----------|-------|---------|--------|
| canCreate | ✅ | ✅ | ❌ |
| canEdit | ✅ | ✅ | ❌ |
| canDelete | ✅ | ❌ | ❌ |
| canAssign | ✅ | ✅ | ❌ |
| canManageUsers | ✅ | ❌ | ❌ |
| canAccessSettings | ✅ | ❌ | ❌ |
| canViewDashboard | ✅ | ✅ | ✅ |
| canViewCatalog | ✅ | ✅ | ✅ |

---

## `useAuth` — hook autenticazione

```typescript
const { user, isAuthenticated, login, logout, permissions, hasRole } = useAuth();

// Usare permissions per proteggere le azioni UI:
if (permissions.canCreate) { /* mostra pulsante Nuovo Asset */ }
if (permissions.canDelete) { /* mostra pulsante Elimina */ }
```

---

## Helper e costanti disponibili (`src/lib/asset-helpers.ts`)

- `ASSET_CATEGORIES` — array di tutte le categorie
- `ASSET_STATUSES` — array di tutti gli stati
- `BRANDS_BY_CATEGORY` — marche per categoria
- `STATUS_COLORS` — mapping stato → classi colore Tailwind
- `STATUS_BADGE_VARIANT` — mapping stato → variante badge shadcn
- `CHART_PALETTE` — palette colori per i grafici
- `formatCurrency(n)` — formatta numero come valuta €
- `formatDate(s)` — formatta stringa data
- `getWarrantyStatus(asset)` — calcola stato garanzia

---

## Componenti grafici (`src/components/charts.tsx`) — GIÀ PRONTI

Non riscrivere grafici: usa quelli esistenti passando i dati calcolati.

```tsx
import { DonutChart, HorizontalBarChart, StackedBarChart } from "@/components/charts";
import type { ChartDatum } from "@/components/charts";

// DonutChart — grafico a ciambella con legenda
<DonutChart data={[{ label: "In uso", value: 20 }, { label: "Disponibile", value: 5 }]} size={200} />

// HorizontalBarChart — barre orizzontali
<HorizontalBarChart data={[{ label: "Laptop", value: 10 }]} />

// StackedBarChart — barre impilate per più serie
<StackedBarChart data={stackedData} />
```

---

## Workflow shadcn/ui via MCP

**Sempre** seguire questo workflow prima di scrivere un nuovo componente UI:

### 1. Controlla se il componente esiste già
```
src/components/ui/ → badge, button, card, dropdown-menu, input, label, select, table
```

### 2. Se non esiste, cercalo con MCP
```
mcp_shadcn_search_items_in_registries("dialog")
mcp_shadcn_view_items_in_registries(["dialog"])
mcp_shadcn_get_item_examples_from_registries(["dialog"])
```

### 3. Ottieni il comando di installazione e aggiungilo
```
mcp_shadcn_get_add_command_for_items(["dialog"])
# → npx shadcn@latest add dialog
# eseguire da asset-management/
```

### 4. Importa e usa il componente
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
```

**Componenti tipicamente necessari per le feature:**
- Catalogo: `dialog` o `sheet`, `form`, `pagination`, `tooltip`
- Dashboard: usare `charts.tsx` già pronti, eventualmente `progress`
- Utenti: `dialog`, `form`, `avatar`

---

## Convenzioni di codice

### Struttura componente page
```tsx
// src/features/<area>/<NomePage>.tsx
import { useAuth } from "@/hooks/useAuth";
// ... altri import

export function NomePage() {
  const { permissions } = useAuth();
  // ...
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Titolo Pagina</h1>
        <p className="text-muted-foreground mt-1">Sottotitolo descrittivo.</p>
      </div>
      {/* contenuto */}
    </div>
  );
}
```

### Form con react-hook-form + zod
```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  nome: z.string().min(1, "Campo obbligatorio"),
  categoria: z.enum(["Laptop", "Monitor", /* ... */]),
  costo: z.number({ invalid_type_error: "Inserisci un numero" }).positive(),
});
type FormValues = z.infer<typeof schema>;

function AssetForm() {
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });
  const onSubmit = (data: FormValues) => { /* ... */ };
  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>;
}
```

### Stato locale mock (senza backend)
```tsx
// In ogni Page, usa useState inizializzato con i dati mock:
const [assets, setAssets] = useState<Asset[]>(mockAssets);

// Aggiungi:
const newAsset: Asset = { id: `A${Date.now()}`, ...formData };
setAssets(prev => [...prev, newAsset]);

// Modifica:
setAssets(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));

// Soft delete (non rimuovere, cambia stato):
setAssets(prev => prev.map(a => a.id === id ? { ...a, stato: "Dismesso" } : a));
```

### Badge di stato
```tsx
import { Badge } from "@/components/ui/badge";
import { STATUS_BADGE_VARIANT } from "@/lib/asset-helpers";

<Badge variant={STATUS_BADGE_VARIANT[asset.stato]}>{asset.stato}</Badge>
```

### Tailwind v4 — regole CSS-first
- **Non** creare o modificare `tailwind.config.js` — non esiste
- Usare le variabili CSS del tema: `bg-sidebar`, `text-muted-foreground`, `border-sidebar-border`
- Per colori custom, definire in `src/index.css` con `@theme { --color-xxx: ... }`
- Classe utility: sempre `cn()` da `@/lib/utils`

---

## Routing (`src/App.tsx`)

Le route esistenti sono:
- `/` → `DashboardPage`
- `/catalogo` → `CatalogPage`
- `/utenti` → `UsersPage`
- `/settings` → `SettingsPage` (solo Admin)

Per aggiungere sub-route o route parametriche (es. `/catalogo/:id`):
```tsx
<Route path="/catalogo/:id" element={<AssetDetailPage />} />
```

---

## Verifica del lavoro

**Sempre eseguire questi comandi al termine di ogni implementazione:**

```bash
# Dalla cartella asset-management/
npm run lint    # zero errori TypeScript/ESLint
npm run build   # build production senza errori
```

Se ci sono errori di lint o build, correggerli prima di considerare il task completato.

---

## Priorità di implementazione (Sprint Backlog)

### Sprint 2 — Catalogo Asset (Must)
1. **ASSET-004** Tabella catalogo asset con dati mock, colonne: nome/categoria/marca/stato/assegnatoA/costo
2. **ASSET-021** Scheda dettaglio asset (Dialog o Sheet con tutti i campi)
3. **ASSET-005** Form creazione nuovo asset (Dialog con react-hook-form + zod)
4. **ASSET-008** Ricerca full-text + filtri per categoria e stato

### Sprint 3 — CRUD Completo + Assegnazioni (Must)
5. **ASSET-006** Form modifica asset (stesso form creazione, pre-popolato)
6. **ASSET-007** Soft delete asset (cambio stato a "Dismesso" con confirm dialog)
7. **ASSET-009** Assegnazione asset a dipendente (Select da mockUsers)
8. **ASSET-010** Revoca assegnazione (bottone "Revoca" con confirm)
9. **ASSET-012** Badge ciclo di vita con colori per stato

### Sprint 4-5 — Dashboard & Report (Should)
10. **ASSET-015** Dashboard con grafici: DonutChart per stati, HorizontalBarChart per categorie
11. **ASSET-016** Report distribuzione per reparto con StackedBarChart
12. **ASSET-017** Export CSV degli asset filtrati (usare `src/lib/csv.ts`)

---

## Anti-pattern da evitare

- ❌ Non installare librerie di grafici esterne (recharts, chart.js, ecc.) — usare `charts.tsx`
- ❌ Non modificare `useAuth.tsx`, `types.ts`, `mock-data.ts`
- ❌ Non scrivere componenti UI da zero se esistono in shadcn/ui
- ❌ Non usare `any` in TypeScript — sempre tipizzare correttamente
- ❌ Non aggiungere `tailwind.config.js`
- ❌ Non usare `console.log` in produzione
- ❌ Non mostrare pulsanti di azione (Crea/Modifica/Elimina) a utenti senza permesso


## NoBlockingHooks
- Non introdurre hook di blocco su instruction/skills.
