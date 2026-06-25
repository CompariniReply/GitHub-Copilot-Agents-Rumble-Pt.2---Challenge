---
name: Challenge 1 — Catalogo Asset
description: Implementa la feature completa del Catalogo Asset (Sprint 2, Epic E2): tabella paginata, scheda dettaglio, form creazione e ricerca/filtri avanzati.
mode: agent
tools:
  - mcp_shadcn_search_items_in_registries
  - mcp_shadcn_view_items_in_registries
  - mcp_shadcn_get_item_examples_from_registries
  - mcp_shadcn_get_add_command_for_items
  - mcp_shadcn_list_items_in_registries
  - read_file
  - grep_search
  - file_search
  - replace_string_in_file
  - multi_replace_string_in_file
  - create_file
  - run_in_terminal
  - get_errors
  - list_dir
---

# Challenge 1 — Catalogo Asset

Implementa la feature **Catalogo Asset** in `asset-management/src/features/assets/CatalogPage.tsx`.
Il file oggi è un placeholder: sostituisci l'intera implementazione rispettando le regole e i criteri di accettazione descritti di seguito.

---

## Contesto progetto

- **Stack**: React 19, Vite, Tailwind v4, shadcn/ui, react-hook-form + zod, React Router v7
- **Dati**: usa `mockAssets` da `@/lib/mock-data` (stato locale con `useState`)
- **Tipi**: importa da `@/lib/types` — non ridefinirli
- **Helper**: usa `ASSET_CATEGORIES`, `ASSET_STATUSES`, `BRANDS_BY_CATEGORY`, `STATUS_BADGE_VARIANT`, `formatCurrency`, `formatDate` da `@/lib/asset-helpers`
- **Permessi**: usa `useAuth()` — non mostrare azioni a chi non ha il permesso

---

## User Story da implementare (in ordine)

### ASSET-004 — Tabella catalogo paginata (5 SP)

**Criteri di accettazione:**
- Tabella con colonne: Nome, Categoria, Marca, Modello, Numero Seriale, Stato, Assegnato a, Data Acquisto
- Paginazione: **20 righe per pagina** con controlli navigazione (Precedente / Pagina n di N / Successivo)
- Click sull'header colonna → ordina per quella colonna (ascendente); secondo click → discendente
- Colonna Stato → `<Badge variant={STATUS_BADGE_VARIANT[asset.stato]}>` con il testo dello stato
- Click su una riga → apre la scheda dettaglio (ASSET-021)

**Componenti shadcn da usare:**
- `table` — già presente in `src/components/ui/table.tsx`
- `pagination` — cerca con MCP, installa se non presente, usa `npx shadcn@latest add pagination`
- `badge` — già presente

---

### ASSET-021 — Scheda dettaglio asset (3 SP)

**Criteri di accettazione:**
- Click su riga → si apre un `Sheet` (o `Dialog`) con tutti i dati dell'asset
- Sezioni dati organizzate in: **Dati Generali**, **Dettagli Tecnici**, **Assegnazione**, **Ciclo di Vita**
- Dati mostrati: nome, categoria, marca, modello, numero seriale, data acquisto, costo (formattato con `formatCurrency`), garanzia in mesi, stato (Badge), assegnato a, reparto, ubicazione, note
- Viewer: vede solo la scheda in lettura
- Admin/Manager: vede anche i pulsanti "Modifica" (placeholder per Sprint 3) e — solo Admin — "Elimina" (placeholder per Sprint 3)

**Componenti shadcn da usare:**
- `sheet` — cerca con MCP: `mcp_shadcn_search_items_in_registries("sheet")`, poi installa

---

### ASSET-005 — Creazione nuovo asset (5 SP)

**Criteri di accettazione:**
- Pulsante "Nuovo Asset" visibile solo a chi ha `permissions.canCreate`
- Click → apre un `Dialog` con form react-hook-form + zod
- **Campi obbligatori**: Nome, Categoria (dropdown), Marca (dropdown filtrato per categoria), Modello, Numero Seriale, Data Acquisto, Costo (€), Garanzia (mesi)
- **Campi opzionali**: Ubicazione, Note
- Marca dipendente dalla Categoria: usa `BRANDS_BY_CATEGORY[categoria]`
- Validazione inline: "Campo obbligatorio" per i required, "Deve essere un numero positivo" per costo
- "Salva" → asset aggiunto a `mockAssets` locale (stato React), notifica successo (toast o alert), dialog chiuso
- "Annulla" → dialog chiuso senza modifiche

**Schema zod di riferimento:**
```typescript
const assetSchema = z.object({
  nome: z.string().min(1, "Campo obbligatorio"),
  categoria: z.enum([...ASSET_CATEGORIES]),
  marca: z.string().min(1, "Campo obbligatorio"),
  modello: z.string().min(1, "Campo obbligatorio"),
  numeroSeriale: z.string().min(1, "Campo obbligatorio"),
  dataAcquisto: z.string().min(1, "Campo obbligatorio"),
  costo: z.number({ invalid_type_error: "Inserisci un numero valido" }).positive("Deve essere positivo"),
  garanziaMesi: z.number({ invalid_type_error: "Inserisci un numero valido" }).int().positive(),
  ubicazione: z.string().optional(),
  note: z.string().optional(),
});
```

**Componenti shadcn da usare:**
- `dialog` — cerca con MCP e installa se non presente
- `form` — cerca con MCP: `mcp_shadcn_search_items_in_registries("form")`
- `input`, `label`, `select` — già presenti

---

### ASSET-008 — Ricerca e filtri avanzati (5 SP)

**Criteri di accettazione:**
- Barra di ricerca full-text: filtra su `nome`, `marca`, `modello` (case-insensitive)
- Filtro **Categoria**: Select con "Tutte le categorie" + ogni valore di `ASSET_CATEGORIES`
- Filtro **Stato**: Select con "Tutti gli stati" + ogni valore di `ASSET_STATUSES`
- I filtri si applicano in tempo reale (senza submit)
- Pulsante "Reset filtri" → riporta tutti i filtri a vuoto
- La paginazione si azzera al cambio filtri (torna a pagina 1)
- Se nessun asset corrisponde → messaggio "Nessun asset trovato con i filtri applicati."

---

## Istruzioni operative

### 1. Verifica componenti shadcn già installati
```
src/components/ui/: badge, button, card, dropdown-menu, input, label, select, table
```

### 2. Installa i componenti mancanti via MCP
Per ogni componente non trovato in `src/components/ui/`, esegui:
1. `mcp_shadcn_search_items_in_registries("<nome>")` — verifica disponibilità
2. `mcp_shadcn_get_add_command_for_items(["<nome>"])` — ottieni il comando
3. Esegui il comando dalla directory `asset-management/`

### 3. Implementa nell'ordine corretto
```
ASSET-004 (tabella base) → ASSET-021 (detail sheet) → ASSET-005 (form crea) → ASSET-008 (filtri)
```

### 4. Pattern stato locale
```typescript
const [assets, setAssets] = useState<Asset[]>(mockAssets);
// Aggiungi nuovo asset:
const newId = `A${String(assets.length + 1).padStart(3, "0")}`;
setAssets(prev => [...prev, { id: newId, stato: "Disponibile", assegnatoA: null, reparto: null, ...formData }]);
```

### 5. Verifica finale obbligatoria
```bash
cd asset-management
npm run lint   # zero errori
npm run build  # build production senza errori
```

---

## Anti-pattern da evitare

- ❌ Non mostrare "Nuovo Asset" a Viewer (`permissions.canCreate === false`)
- ❌ Non mostrare "Modifica" / "Elimina" a chi non ha il permesso
- ❌ Non scrivere componenti UI a mano se disponibili in shadcn/ui
- ❌ Non ridefinire tipi già presenti in `types.ts`
- ❌ Non usare `any` in TypeScript
- ❌ Non dimenticare di resettare la pagina corrente a 1 quando cambiano i filtri
