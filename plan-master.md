# Piano di Implementazione — Asset Management Challenge

## Fase 0 — Creare l'agente Copilot

**Output**: `.github/agents/asset-frontend.agent.md`
**Flusso**: Fase 0 (noi) → Lanciare l'agente → L'agente esegue Fasi 1-3

### Cosa deve contenere l'agente

Un file conciso (~60-80 righe) che:

1. **Dichiara il ruolo**: implementare feature frontend per l'app Asset Management
2. **Punta ai file di riferimento** (non duplica il contenuto):
   - `README.md` per stack e convenzioni generali
   - `docs/user-stories.md` per i criteri BDD (fonte di verità)
   - `docs/mockup-data.md` per i dati di riferimento
3. **Specifica le decisioni architetturali non derivabili dai file**:
   - **State management**: `useState` in `CatalogPage` inizializzato da `mockAssets`. Le modifiche (nuovo asset) sono in-memory per sessione, non persistite.
   - **Routing**: le route `/catalogo` e `/` esistono già in `App.tsx` — non toccarle, riempire solo i componenti placeholder.
   - **Componenti shadcn già presenti**: `button`, `input`, `label`, `select`, `card`, `table`, `badge`, `dropdown-menu` — non reinstallarli.
   - **Componenti da installare via MCP**: `dialog`, `form`, `pagination` (e altri se necessari — cercare prima, installare poi).
4. **Direttive MCP shadcn**: cercare → ispezionare → installare (`npx shadcn@latest add <componente>`) → riutilizzare
5. **Vincolo di verifica**: ogni feature deve chiudere con `npm run lint` + `npm run build` senza errori
6. **Riferimento a skills del repo**: `react-best-practices`, `tailwind-patterns`, `form-cro`

### Cosa NON inserire

- Tabelle di stack/convenzioni già nel README o CLAUDE.md
- Copia di tipi, helper, o struttura file (l'agente legge il codice)
- Istruzioni di routing o setup iniziale (già fatto)
- Checklist operative (npm install, ecc.) — l'agente lo sa fare

---

## Fase 1 — Challenge 1: Catalogo Asset

### 1.1 Tabella catalogo (ASSET-004, 5 SP)

- Rendere `CatalogPage.tsx` con una tabella che mostra: ID, Nome, Categoria, Marca, Modello, N. Seriale, Stato (badge colorato), Assegnato a, Data Acquisto
- Paginazione a 20 righe (aggiungere componente `pagination` via shadcn MCP)
- Ordinamento per colonna (click header → asc/desc)
- Dati da `mockAssets`

### 1.2 Dettaglio asset (ASSET-021, 3 SP)

- Click su riga → apertura scheda dettaglio (dialog/sheet oppure sotto-vista)
- Sezioni: Dati Generali, Dettagli Tecnici, Assegnazione, Ciclo di Vita
- Immagine placeholder, tutti i campi del tipo `Asset`

### 1.3 Creazione nuovo asset (ASSET-005, 5 SP)

- Pulsante "Nuovo Asset" visibile solo se `permissions.canCreate`
- Form con `react-hook-form` + `zod`: Nome, Categoria (dropdown), Marca (filtrata da `BRANDS_BY_CATEGORY`), Modello, N. Seriale, Data Acquisto, Costo (€), Garanzia (mesi), Note
- Validazione campi obbligatori, notifica successo, ritorno alla lista
- Aggiungere componente `dialog` o `sheet` + `form` via shadcn MCP

### 1.4 Ricerca e filtri (ASSET-008, 5 SP)

- Barra ricerca testuale (filtra su nome, marca, modello)
- Filtri dropdown: Categoria, Stato (da `ASSET_CATEGORIES`, `ASSET_STATUSES`)
- Pulsante "Reset filtri"
- Filtri applicati in tempo reale sulla tabella

### 1.5 Export CSV (ASSET-017, 3 SP)

- Pulsante "Esporta CSV" (visibile ad Admin)
- Usa `downloadCSV` da `src/lib/csv.ts`, esportando gli asset attualmente filtrati
- Colonne: ID, Nome, Categoria, Marca, Modello, N. Seriale, Stato, Assegnato A, Reparto, Data Acquisto, Costo, Garanzia Mesi

---

## Fase 2 — Challenge 2: Dashboard & Reportistica

### 2.1 KPI dinamici (ASSET-015, 8 SP — parte 1)

- Refactoring della Dashboard esistente: i KPI ci sono già, ma vanno verificati e mantenuti dinamici
- Aggiungere sezione grafici sotto i KPI

### 2.2 Grafico distribuzione per stato (ASSET-015 — parte 2)

- Usare `DonutChart` da `src/components/charts.tsx`
- Calcolare raggruppamento `mockAssets` per `stato`, passare come `ChartDatum[]`
- Colori da `STATUS_COLORS`

### 2.3 Grafico asset per reparto (ASSET-015 — parte 3)

- Usare `HorizontalBarChart`
- Raggruppare `mockAssets` per `reparto`, ordinare desc

### 2.4 Grafici distribuzione per categoria (ASSET-023, 5 SP)

- Usare `StackedBarChart`
- Asse X = categorie, segmenti = stati (Disponibile, In uso, Manutenzione, Dismesso)
- Colori da `STATUS_COLORS`
- Tooltip già integrato nel componente (`title` su `div`)

### 2.5 Report per reparto (ASSET-016, 5 SP)

- Sezione/tab "Report" nella Dashboard (o come sotto-sezione)
- Tabella: Reparto, N. Asset, Valore Totale (€ via `formatCurrency`), Asset più vecchio, Asset più recente
- Click su reparto → dettaglio con elenco asset di quel reparto
- Visibile solo se `permissions.canViewReports`

---

## Fase 3 — Verifica e consegna

1. `npm run lint` — zero errori
2. `npm run build` — zero errori
3. Test manuale con tutti e 3 i ruoli (Admin, Manager, Viewer) per verificare permessi
4. Verifica aderenza ai criteri BDD di ogni user story

---

## Ordine di esecuzione consigliato

| Step | Cosa | Perché |
|------|------|--------|
| 0 | Agente Copilot | Serve per guidare tutto il lavoro |
| 1.1 | Tabella catalogo | Base per tutto il resto del catalogo |
| 1.4 | Ricerca/filtri | Dipende da 1.1, migliora la tabella |
| 1.2 | Dettaglio asset | Dipende dalla tabella (click su riga) |
| 1.3 | Creazione asset | Form indipendente, dipende da tabella |
| 1.5 | Export CSV | Usa filtri della tabella |
| 2.1-2.3 | Dashboard KPI + grafici | Componenti grafici già pronti |
| 2.4 | Stacked chart categoria | Estende la dashboard |
| 2.5 | Report per reparto | Ultima feature, dipende dai dati aggregati |
| 3 | Lint + build + test manuale | Chiude il ciclo |
