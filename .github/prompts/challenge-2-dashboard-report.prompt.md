---
name: Challenge 2 - Dashboard e Reportistica
description: Implementa Dashboard dinamica, report reparto ed export CSV (ASSET-015, ASSET-023, ASSET-016, ASSET-017).
mode: agent
tools:
  - read_file
  - grep_search
  - file_search
  - list_dir
  - replace_string_in_file
  - multi_replace_string_in_file
  - create_file
  - run_in_terminal
  - get_errors
---

# Challenge 2 - Dashboard e Reportistica

Implementa la feature completa in asset-management/src/features/dashboard/DashboardPage.tsx.

## Scope
- ASSET-015: KPI dinamici + grafici stato
- ASSET-023: distribuzione per categoria
- ASSET-016: report distribuzione per reparto
- ASSET-017: export dati in CSV

## Contesto tecnico
- Stack: React 19, TypeScript, Tailwind v4, shadcn/ui
- Dati: src/lib/mock-data.ts
- Tipi: src/lib/types.ts
- Helper: src/lib/asset-helpers.ts
- CSV helper: src/lib/csv.ts
- Grafici: src/components/charts.tsx
- Permessi: src/hooks/useAuth.tsx

## Criteri di accettazione
1. KPI
- Calcolati da dati reali (nessun valore hardcoded)
- Mostra almeno: totale asset, in uso, disponibili, in manutenzione, dismessi, valore totale inventario

2. Grafici
- Donut chart per distribuzione stato
- Bar chart per distribuzione categoria
- Stacked chart per distribuzione reparto/stato

3. Report reparto
- Tabella con colonne: reparto, totale, in uso, disponibili, in manutenzione, dismessi
- Reparti null mappati a Non assegnato

4. Export CSV
- Pulsante export visibile solo con permissions.canViewReports
- Esporta KPI, stato, categoria e report reparto
- File apribile in Excel con intestazioni chiare

5. Permessi
- Pagina accessibile solo con permissions.canViewDashboard
- Azioni report/export nascoste senza permesso

## Vincoli
- Non ridefinire tipi esistenti
- Non usare any
- Non introdurre librerie esterne per i grafici
- Mantieni UI coerente con il design system esistente

## Verifica finale
Esegui da asset-management:
- npm run lint
- npm run build
