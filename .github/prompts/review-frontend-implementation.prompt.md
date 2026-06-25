---
mode: ask
description: Verifica una implementazione frontend del challenge con checklist qualità e output finale sintetico.
---

# Review Frontend Implementation

Esegui una review della feature implementata in `asset-management/` seguendo questa sequenza:

1. Valuta coerenza con stack e convenzioni (React 19, Vite, Tailwind v4, shadcn/ui).
2. Verifica riuso componenti esistenti e uso corretto di `useAuth`.
3. Controlla allineamento con `types.ts` e `mock-data.ts`.
4. Verifica qualità con la checklist in:
   - `./skills/asset-frontend-workflow/references/quality-gate-checklist.md`
5. Riporta rischi e regressioni possibili.

Output richiesto:
- Findings ordinati per severità
- Gap di test/validazione
- Azioni consigliate immediate
