# Asset Management App — Challenge

**Evento**: GitHub Copilot Agents Rumble Pt. 2
**Progetto base**: Asset Management App (React 19 + TypeScript + Vite)

L'app di partenza è già funzionante: login, ruoli/permessi, logout e lista utenti (Sprint 1) sono completi. Le challenge consistono nell'implementare le feature mancanti (i tab oggi placeholder) seguendo lo stack e lo stile del progetto.

> **Idea chiave**: per svolgere le challenge si costruisce **un unico agente Copilot** specializzato nell'implementare il frontend di questa app secondo lo stack e lo stile desiderati. Lo stesso agente serve entrambe le challenge.

---

## 📁 Struttura del repository

```
asset-management/      # L'applicazione React (codice sorgente)
docs/                  # Materiale di supporto all'implementazione (vedi sotto)
README.md              # Questo file — brief delle challenge
```

### I file in `docs/` (materiale di supporto)

Questi documenti **non vanno modificati**: sono la specifica funzionale a cui fare riferimento durante l'implementazione delle challenge.

| File | A cosa serve |
|------|--------------|
| [`docs/product-backlog.md`](docs/product-backlog.md) | Visione di prodotto, le 8 Epic, il backlog completo (24 user story) e il release plan. |
| [`docs/sprint-backlog.md`](docs/sprint-backlog.md) | Suddivisione in 6 sprint con obiettivi, story points e dipendenze. |
| [`docs/user-stories.md`](docs/user-stories.md) | Dettaglio di ogni user story con criteri di accettazione BDD (Given/When/Then). **Fonte di verità per la Definition of Done.** |
| [`docs/mockup-data.md`](docs/mockup-data.md) | Dati mockup di riferimento (utenti, asset, reparti) usati nell'app. |

---

## 🚀 Avvio del progetto

> **Windows, macOS o Linux?** I comandi mostrati sotto (`node`, `npm`, `cd`) sono **identici su tutti i sistemi operativi**: puoi eseguirli in PowerShell su Windows o nel Terminale (bash/zsh) su macOS e Linux. Dove un comando cambia tra i sistemi, trovi entrambe le versioni.

### Prerequisiti
- [Node.js](https://nodejs.org/) 20 o superiore (consigliato 22+)
- npm 10 o superiore (incluso con Node.js)

Verifica le versioni installate:

```powershell
node -v
npm -v
```

### Passi

1. **Posizionati nella cartella dell'app** (il codice sorgente è in `asset-management/`, non nella root):

   ```powershell
   cd asset-management
   ```

2. **Installa le dipendenze** (solo la prima volta, o dopo modifiche a `package.json`):

   ```powershell
   npm install
   ```

3. **Avvia il server di sviluppo** (con hot-reload):

   ```powershell
   npm run dev
   ```

4. Apri il browser su **http://localhost:5173**. Il login è la prima schermata: usa una delle credenziali demo qui sotto.

### Script disponibili

| Comando | Descrizione |
|---------|-------------|
| `npm run dev` | Avvia il dev server Vite con hot-reload su http://localhost:5173 |
| `npm run build` | Compila TypeScript e genera la build di produzione in `dist/` |
| `npm run preview` | Serve localmente la build di produzione per verificarla |
| `npm run lint` | Esegue ESLint sull'intero progetto |

> Prima di consegnare una challenge, assicurati che `npm run lint` e `npm run build` terminino **senza errori**.

### Credenziali demo

| Ruolo | Email | Password |
|-------|-------|----------|
| Admin | `mario.rossi@azienda.it` | `Admin123!` |
| Manager | `laura.bianchi@azienda.it` | `Manager123!` |
| Viewer | `marco.neri@azienda.it` | `Viewer123!` |

---

## 📐 Stack & convenzioni

| Ambito | Tecnologia |
|--------|-----------|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Routing | React Router 7 |
| Styling | Tailwind CSS v4 |
| Componenti UI | shadcn/ui (in `src/components/ui/`) |
| Form & validazione | `react-hook-form` + `zod` |
| Icone | `lucide-react` |
| Auth/permessi | hook `useAuth` (`src/hooks/useAuth.tsx`) |
| Dati | mock in `src/lib/mock-data.ts`, tipi in `src/lib/types.ts` |

**Regole di stile da rispettare**: riutilizzare i componenti esistenti in `src/components/ui/`, seguire la struttura per feature in `src/features/`, rispettare i permessi per ruolo (Admin / Manager / Viewer) e mantenere il codice privo di errori TypeScript/ESLint (`npm run lint`, `npm run build`).

---

## � Cosa è già pronto (usalo, non rifarlo)

Per farti risparmiare tempo, una parte dell'impalcatura è **già nel progetto**: appoggiati a questi elementi invece di ricostruirli da zero.

| Elemento | Dove | A cosa serve |
|----------|------|--------------|
| **Tipi di dominio** | [`src/lib/types.ts`](asset-management/src/lib/types.ts) | `Asset`, `AssetCategory`, `AssetStatus`, `RolePermissions`, ecc. |
| **Dati mock** | [`src/lib/mock-data.ts`](asset-management/src/lib/mock-data.ts) | 34 asset, 10 utenti, 8 reparti già popolati. |
| **Helper di dominio e formattazione** | [`src/lib/asset-helpers.ts`](asset-management/src/lib/asset-helpers.ts) | Categorie e stati pronti, **marche per categoria** (per il form), `formatCurrency` (€), `formatDate`/`parseDate`, mapping **stato → variante Badge** e **colori** per i grafici. |
| **Export CSV pronto** | [`src/lib/csv.ts`](asset-management/src/lib/csv.ts) | `downloadCSV(nome, righe)` genera e scarica un CSV **già compatibile con Excel** (separatore `;` + BOM UTF-8) — risolve ASSET-017 a livello di utility, a te resta solo decidere *cosa* esportare. |
| **Grafici pronti** | [`src/components/charts.tsx`](asset-management/src/components/charts.tsx) | `DonutChart`, `HorizontalBarChart`, `StackedBarChart` in SVG puro (nessuna dipendenza): passi i dati, pensano loro al rendering. Il **calcolo** dei dati (KPI, raggruppamenti) resta parte della challenge. |
| **Componenti UI** | [`src/components/ui/`](asset-management/src/components/ui/) | `button`, `input`, `label`, `select`, `card`, `table`, `badge`, `dropdown-menu`. |
| **Auth & permessi** | [`src/hooks/useAuth.tsx`](asset-management/src/hooks/useAuth.tsx) | Login, ruoli e `permissions` (`canCreate`, `canViewReports`, …) già funzionanti. |
| **MCP shadcn/ui** | [`.vscode/mcp.json`](.vscode/mcp.json) | Server MCP **già configurato**: usalo per cercare e aggiungere i componenti che mancano (es. `dialog`, `pagination`, `textarea`). |

> ✅ Il progetto parte con **`npm run lint` e `npm run build` puliti**: se vedi errori, sono introdotti dalle tue modifiche.

---

## �🤖 L'agente da costruire

Parte integrante della sfida è creare **un agente Copilot dedicato** (`.github/agents/<nome>.agent.md`) che implementi il frontend di questa app secondo lo stack e lo stile sopra descritti.

L'agente dovrebbe:
- conoscere lo stack (React 19, Vite, Tailwind v4, shadcn/ui, `react-hook-form` + `zod`, React Router);
- riutilizzare i componenti e le convenzioni esistenti invece di reinventarli;
- **usare la component library shadcn/ui tramite il relativo MCP server** per cercare, ispezionare e aggiungere componenti (vedi sotto);
- rispettare i permessi per ruolo tramite `useAuth`;
- usare i tipi (`types.ts`) e i dati mock (`mock-data.ts`) già presenti;
- verificare il proprio lavoro con `npm run lint` e `npm run build`.

Lo stesso agente è utilizzabile per entrambe le challenge qui sotto.

### Component library shadcn/ui via MCP

Il progetto usa **shadcn/ui** e nell'ambiente è disponibile il **MCP server di shadcn**: l'agente deve sfruttarlo per lavorare con i componenti invece di scriverli a mano. Tipicamente l'agente dovrebbe:

- **cercare** i componenti disponibili nei registry (es. `table`, `dialog`, `form`, `pagination`, `chart`);
- **ispezionare** la definizione e gli esempi d'uso di un componente prima di integrarlo;
- **ottenere il comando di installazione** e aggiungere il componente al progetto (es. `npx shadcn@latest add <componente>`), che lo crea in `src/components/ui/`;
- **riutilizzare** i componenti già presenti in `src/components/ui/` quando esistono, aggiungendone di nuovi solo se necessari per la challenge.

> Suggerimento: per il Catalogo potrebbero servirti componenti come `dialog`/`sheet`, `form`, `pagination` (usa l'MCP per aggiungerli). Per la Dashboard i grafici sono **già pronti** in [`src/components/charts.tsx`](asset-management/src/components/charts.tsx): ti basta calcolare i dati e passarli ai componenti, mantenendo lo stile coerente con quelli esistenti.

---

## Challenge 1 — Catalogo Asset 🗂️

> **Tab da implementare**: Catalogo (oggi placeholder "sarà implementato nello Sprint 2")
> **Sprint di riferimento**: Sprint 2 — Epic E2
> **Difficoltà**: Intermedia · **Story Points complessivi**: 18 SP
> **File principale**: [`asset-management/src/features/assets/CatalogPage.tsx`](asset-management/src/features/assets/CatalogPage.tsx)

### Obiettivo
Costruire la feature di consultazione e gestione del catalogo asset: tabella, ricerca, filtri, scheda dettaglio e creazione nuovo asset.

### User Story da completare

| ID | Titolo | SP | Priorità |
|----|--------|:--:|----------|
| ASSET-004 | Visualizzazione catalogo asset con tabella | 5 | Must |
| ASSET-021 | Dettaglio singolo asset con scheda completa | 3 | Must |
| ASSET-005 | Creazione nuovo asset elettronico | 5 | Must |
| ASSET-008 | Ricerca e filtri avanzati catalogo | 5 | Must |

### Cosa ti chiediamo

In parole semplici, la sezione **Catalogo** deve permettere a chi usa l'app di:

- **vedere tutti gli asset** in un elenco chiaro, facile da scorrere e da ordinare;
- **aprire un singolo asset** per consultarne la scheda con tutte le informazioni;
- **aggiungere un nuovo asset** tramite un form guidato (riservato a chi ne ha i permessi);
- **cercare e filtrare** gli asset per trovare in fretta ciò che serve.

L'esperienza deve risultare fluida, coerente con il resto dell'app e rispettare i permessi dei vari ruoli (es. chi può solo consultare non deve poter creare). Il dettaglio puntuale di ogni comportamento atteso, se ti serve, lo trovi nelle user story in [`docs/user-stories.md`](docs/user-stories.md).

---

## Challenge 2 — Dashboard & Reportistica 📊

> **Tab da potenziare**: Dashboard (oggi con dati statici) + sezione Report
> **Sprint di riferimento**: Sprint 4–5 — Epic E5
> **Difficoltà**: Avanzata · **Story Points complessivi**: 21 SP
> **File principale**: [`asset-management/src/features/dashboard/DashboardPage.tsx`](asset-management/src/features/dashboard/DashboardPage.tsx)

### Obiettivo
Trasformare i dati grezzi in insight: KPI dinamici, grafici di distribuzione, report per reparto ed export CSV.

### User Story da completare

| ID | Titolo | SP | Priorità |
|----|--------|:--:|----------|
| ASSET-015 | Dashboard panoramica asset (KPI + grafici stato) | 8 | Should |
| ASSET-023 | Grafici distribuzione per categoria | 5 | Could |
| ASSET-016 | Report distribuzione asset per reparto | 5 | Should |
| ASSET-017 | Export dati in CSV | 3 | Should |

### Cosa ti chiediamo

In parole semplici, la **Dashboard** deve raccontare lo stato del parco asset a colpo d'occhio:

- **numeri sintetici (KPI)** calcolati dai dati reali (quanti asset ci sono, in che stato si trovano, ecc.);
- **grafici** che mostrano come sono distribuiti gli asset (per stato e per categoria);
- una **vista riepilogativa per reparto**;
- la possibilità di **esportare i dati** in un file scaricabile e apribile con Excel.

Tutto deve aggiornarsi in base ai dati effettivi (niente numeri "finti" scritti a mano) e mantenere uno stile coerente con il resto dell'app. Il dettaglio puntuale di ogni comportamento atteso, se ti serve, lo trovi nelle user story in [`docs/user-stories.md`](docs/user-stories.md).

---

## Riepilogo challenge

| # | Challenge | Tab | Sprint | SP | Difficoltà |
|:-:|-----------|-----|:------:|:--:|-----------|
| 1 | Catalogo Asset | Catalogo | 2 | 18 | Intermedia |
| 2 | Dashboard & Reportistica | Dashboard / Report | 4–5 | 21 | Avanzata |

> Dettaglio completo dei criteri BDD per ogni user story: [`docs/user-stories.md`](docs/user-stories.md).
> Pianificazione e sprint completi: [`docs/sprint-backlog.md`](docs/sprint-backlog.md) e [`docs/product-backlog.md`](docs/product-backlog.md).
