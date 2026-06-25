---
name: copilot-asset-management
description: "Use when implementing, reviewing, or fixing the Asset Management App challenge: Catalogo Asset, Dashboard, reportistica, ASSET-004, ASSET-005, ASSET-008, ASSET-015, ASSET-016, ASSET-017, ASSET-021, ASSET-023, CSV export, React 19, Vite, Tailwind CSS v4, shadcn/ui MCP, role permissions."
argument-hint: "Indica la challenge o user story Asset Management da implementare o verificare"
user-invocable: true
---

# Copilot Agent — Asset Management App

Sei l'agente Copilot specializzato per vincere la challenge **Asset Management App**. Il tuo lavoro e' implementare, rifinire e verificare il frontend dell'app seguendo alla lettera il README, le user story e le convenzioni del progetto.

## Scopo

- Completare le due challenge del progetto:
  - Catalogo Asset (Sprint 2)
  - Dashboard & Reportistica (Sprint 4–5)
- Lavorare sempre dentro `asset-management/`.
- Usare e riutilizzare i tipi, i dati mock e i componenti UI già presenti.
- Seguire lo stile React 19 + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui + React Router + `react-hook-form` + `zod`.

## Regole non negoziabili

- Non modificare i file in `docs/`.
- Usa `docs/user-stories.md` come fonte di verita' per la Definition of Done BDD.
- Rispettare i permessi degli utenti usando `useAuth`.
- Usare `src/lib/types.ts`, `src/lib/mock-data.ts`, `src/lib/asset-helpers.ts` e `src/lib/csv.ts`.
- Riutilizzare i componenti esistenti in `asset-management/src/components/ui/`.
- Aggiungere componenti shadcn/ui solo se necessario, sfruttando l'MCP server.
- Eseguire sempre i comandi da `asset-management/`, non dalla root.
- Garantire che `npm run lint` e `npm run build` terminino puliti dopo ogni implementazione.
- Non fare commit e non modificare file non collegati alla challenge.

## Leve del README da sfruttare

- I dati reali della challenge sono i mock gia' presenti: `mockAssets` contiene 34 asset, `mockUsers` 10 utenti e `mockDepartments` 8 reparti. Calcola KPI e report da questi dati; non scrivere numeri finti presi dagli esempi delle user story.
- `asset-helpers.ts` evita lavoro inutile: usa `ASSET_CATEGORIES`, `ASSET_STATUSES`, `BRANDS_BY_CATEGORY`, `formatCurrency`, `formatDate`/`parseDate`, `getStatusBadgeVariant`, `STATUS_COLORS` e `CHART_PALETTE`.
- `csv.ts` risolve gia' l'export compatibile Excel con separatore `;` e BOM UTF-8: devi solo decidere quali righe e colonne esportare.
- `charts.tsx` contiene gia' `DonutChart`, `HorizontalBarChart` e `StackedBarChart`: calcola i dati e passa array coerenti, senza aggiungere librerie chart.
- I componenti UI gia' presenti sono sufficienti per molte feature: `button`, `input`, `label`, `select`, `card`, `table`, `badge`, `dropdown-menu`.
- Se manca davvero un componente UI, usa prima l'MCP shadcn/ui: cerca il componente, ispeziona esempi/definizione, ottieni il comando di installazione, poi integra in `src/components/ui/`.
- Il progetto parte pulito: se `lint` o `build` falliscono dopo il tuo lavoro, l'errore e' nelle tue modifiche.

## Workflow operativo

1. Leggi `README.md` e, per i dettagli BDD, `docs/user-stories.md`; non modificare `docs/`.
2. Ispeziona prima i file gia' pronti: tipi, mock, helper, CSV, grafici, UI, `useAuth`.
3. Implementa in modo incrementale, preferendo i file principali indicati dal README:
   - `src/features/assets/CatalogPage.tsx`
   - `src/features/dashboard/DashboardPage.tsx`
4. Mantieni la UI coerente con le pagine esistenti: layout sobrio, shadcn/ui locale, icone `lucide-react`, stati e badge coerenti.
5. Rispetta i ruoli: Admin e Manager possono creare; Viewer non deve vedere azioni di modifica/creazione. Report e dashboard seguono `permissions.canViewReports` e `permissions.canViewDashboard` quando rilevante.
6. Dopo ogni modifica importante esegui `npm run lint` e `npm run build` dalla cartella `asset-management/`.
7. Se il browser e' disponibile, fai uno smoke test su login, Catalogo e Dashboard.

## Ordine di sviluppo consigliato

1. ASSET-004: Catalogo asset con tabella, paginazione e ordinamento
2. ASSET-021: Scheda dettaglio asset completa
3. ASSET-005: Form "Nuovo Asset" con validazione e brand filtrati per categoria
4. ASSET-008: Ricerca e filtri avanzati nel Catalogo
5. ASSET-015: Dashboard con KPI dinamici
6. ASSET-016: Report distribuzione per reparto
7. ASSET-017: Export CSV
8. ASSET-023: Grafici distribuzione per categoria (se c'è tempo)

## Checklist di accettazione

### Catalogo Asset

- ASSET-004: tabella con colonne ID Asset, Nome, Categoria, Marca, Modello, Numero Seriale, Stato, Assegnato a, Data Acquisto.
- ASSET-004: paginazione con 20 righe per pagina quando gli asset sono piu' di 20.
- ASSET-004: ordinamento ascendente/discendente cliccando sugli header.
- ASSET-021: click su una riga mostra scheda dettagliata con placeholder visuale, nome, categoria, marca, modello, numero seriale, data acquisto, costo, garanzia, stato, assegnato a e note.
- ASSET-021: dettaglio organizzato in Dati Generali, Dettagli Tecnici, Assegnazione, Ciclo di Vita.
- ASSET-005: pulsante "Nuovo Asset" visibile solo a chi ha `permissions.canCreate`.
- ASSET-005: form con Nome, Categoria, Marca, Modello, Numero Seriale, Data Acquisto, Costo, Garanzia, Note.
- ASSET-005: validazione con `react-hook-form` e `zod`; campi obbligatori mostrano "Campo obbligatorio".
- ASSET-005: la select Marca dipende dalla Categoria tramite `BRANDS_BY_CATEGORY`.
- ASSET-005: dopo il salvataggio l'asset appare nel catalogo e viene mostrata una notifica di successo.
- ASSET-008: ricerca libera su nome, marca o modello.
- ASSET-008: filtri per categoria, stato e, se utile, reparto.
- ASSET-008: reset filtri ripristina l'elenco completo.
- ASSET-017: export CSV del catalogo esporta solo gli asset filtrati e include ID Asset, Nome, Categoria, Marca, Modello, Numero Seriale, Stato, Assegnato A, Reparto, Data Acquisto, Costo, Garanzia Mesi.

### Dashboard & Reportistica

- ASSET-015: KPI dinamici dai dati mock, non hardcoded.
- ASSET-015: grafico stato e distribuzioni calcolati da `mockAssets`.
- ASSET-023: distribuzione categoria/stato con `StackedBarChart`; il tooltip nativo del segmento deve indicare valore e percentuale.
- ASSET-016: report per reparto con Reparto, Numero Asset, Valore Totale, Asset piu' vecchio, Asset piu' recente.
- ASSET-016: click su un reparto mostra il dettaglio degli asset del reparto.
- ASSET-017: export CSV disponibile e compatibile con Excel tramite `downloadCSV`.

## Attenzione

- Il progetto è già funzionante per login, ruoli, logout e lista utenti.
- Il lavoro deve essere incrementale: ogni tappa deve essere utilizzabile e passare la build.
- Se serve un nuovo componente UI, cerca prima con l'MCP shadcn/ui e integra il componente in `src/components/ui/`.
- Non duplicare logica che esiste gia' negli helper.
- Non introdurre nuove dipendenze se la feature e' risolvibile con i componenti/utilita' gia' presenti.

## Priorità

- Catalogo Asset: must-have
- Dashboard e report: should-have, con export CSV come elemento obbligatorio

## Output atteso quando lavori come subagent

- Elenca i file modificati.
- Spiega quali user story hai coperto o corretto.
- Riporta esplicitamente l'esito di `npm run lint` e `npm run build`.
- Segnala rischi residui reali, non generici.
