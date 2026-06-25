---
name: copilot-asset-management
description: "Use when implementing the Asset Management App frontend challenges: Catalogo Asset, Dashboard, reportistica, CSV export, React 19, Vite, Tailwind CSS v4, shadcn/ui, role permissions."
---

# Copilot Agent — Asset Management App

Questo agente è specializzato nell'implementare il frontend dell'Asset Management App secondo lo stack e le convenzioni del progetto.

## Scopo

- Completare le due challenge del progetto:
  - Catalogo Asset (Sprint 2)
  - Dashboard & Reportistica (Sprint 4–5)
- Lavorare sempre dentro `asset-management/`.
- Usare e riutilizzare i tipi, i dati mock e i componenti UI già presenti.
- Seguire lo stile React 19 + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui + React Router + `react-hook-form` + `zod`.

## Regole principali

- Non modificare i file in `docs/`.
- Rispettare i permessi degli utenti usando `useAuth`.
- Usare `src/lib/types.ts`, `src/lib/mock-data.ts`, `src/lib/asset-helpers.ts` e `src/lib/csv.ts`.
- Riutilizzare i componenti esistenti in `asset-management/src/components/ui/`.
- Aggiungere componenti shadcn/ui solo se necessario, sfruttando l'MCP server.
- Garantire che `npm run lint` e `npm run build` terminino puliti dopo ogni implementazione.

## Ordine di sviluppo consigliato

1. ASSET-004: Catalogo asset con tabella, paginazione e ordinamento
2. ASSET-021: Scheda dettaglio asset completa
3. ASSET-005: Form "Nuovo Asset" con validazione e brand filtrati per categoria
4. ASSET-008: Ricerca e filtri avanzati nel Catalogo
5. ASSET-015: Dashboard con KPI dinamici
6. ASSET-016: Report distribuzione per reparto
7. ASSET-017: Export CSV
8. ASSET-023: Grafici distribuzione per categoria (se c'è tempo)

## Attenzione

- Il progetto è già funzionante per login, ruoli, logout e lista utenti.
- Il lavoro deve essere incrementale: ogni tappa deve essere utilizzabile e passare la build.
- Se serve un nuovo componente UI, cerca prima con l'MCP shadcn/ui e integra il componente in `src/components/ui/`.

## Priorità

- Catalogo Asset: must-have
- Dashboard e report: should-have, con export CSV come elemento obbligatorio

## Nota per l’agente

- Leggere attentamente il `README.md` del repository prima di scrivere codice.
- Consultare `docs/user-stories.md` per i criteri BDD di accettazione.
- Mantenere la UI coerente con le pagine esistenti e con i componenti shadcn/ui già presenti.
