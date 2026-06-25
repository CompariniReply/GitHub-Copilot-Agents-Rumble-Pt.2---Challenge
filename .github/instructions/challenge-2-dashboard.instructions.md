description: Regole operative per Challenge 2 (Dashboard e Reportistica).
applyTo: asset-management/src/features/dashboard/**/*.tsx

# Challenge 2 Dashboard Rules

Obiettivo:
- Implementare KPI, grafici e report dinamici usando dati reali da mockAssets.
- Evitare numeri hardcoded in UI.

Regole obbligatorie:
- Usa i componenti chart gia presenti in src/components/charts.tsx.
- Non installare librerie chart esterne.
- Non modificare src/lib/types.ts, src/lib/mock-data.ts, src/hooks/useAuth.tsx.
- Usa helper da src/lib/asset-helpers.ts (formatCurrency, costanti stato/categoria, palette).
- Usa useAuth e permissions per gating della vista dashboard e delle azioni report/export.
- Mantieni tipizzazione TypeScript rigorosa e non usare any.
- Preferisci useMemo per tutte le aggregazioni numeriche e dataset dei grafici.

KPI minimi richiesti:
- totaleAsset
- totaleInUso
- totaleDisponibili
- totaleInManutenzione
- totaleDismessi
- valoreTotaleInventario

Dataset grafici richiesti:
- Donut stato: label=stato, value=count
- Bar categoria: label=categoria, value=count
- Stacked reparto: label=reparto, serie per ogni stato

Report tabellare reparto:
- reparto
- totale
- inUso
- disponibili
- inManutenzione
- dismessi

CSV export:
- Usa utility in src/lib/csv.ts
- Esporta KPI, distribuzione stati, distribuzione categorie e report reparto
- Header leggibili e formato compatibile Excel

Permessi:
- Accesso dashboard: permissions.canViewDashboard
- Sezione report/export: permissions.canViewReports

Quality gate finale:
- Esegui npm run lint e npm run build da cartella asset-management
