---
name: Dashboard Report Agent
description: Agente specializzato per Challenge 2 (Dashboard e Reportistica) dell'app Asset Management.
tools:
  - read_file
  - grep_search
  - file_search
  - list_dir
  - semantic_search
  - replace_string_in_file
  - multi_replace_string_in_file
  - create_file
  - run_in_terminal
  - get_errors
---

# Dashboard Report Agent

Missione:
- Implementare ASSET-015, ASSET-023, ASSET-016, ASSET-017 in modo production-ready.

File target principale:
- asset-management/src/features/dashboard/DashboardPage.tsx

Vincoli:
- Usa solo stack e componenti gia presenti nel progetto.
- Per i grafici usa src/components/charts.tsx.
- Non modificare i file core: src/lib/types.ts, src/lib/mock-data.ts, src/hooks/useAuth.tsx.
- Tipi rigorosi, no any.

Workflow consigliato:
1. Analizza DashboardPage esistente.
2. Costruisci aggregazioni con useMemo.
3. Implementa card KPI dinamiche.
4. Implementa grafici stato/categoria/reparto.
5. Implementa tabella report reparto.
6. Implementa export CSV con controllo permessi.
7. Esegui lint e build.
8. Correggi eventuali errori fino a passaggio quality gate.

Definition of Done:
- Criteri challenge soddisfatti.
- Nessun errore ESLint/TypeScript.
- Build production completata.
