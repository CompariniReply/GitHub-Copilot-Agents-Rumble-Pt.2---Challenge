---
mode: agent
description: Implementa una feature frontend dell'app asset-management usando lo stack e i vincoli del challenge.
---

# Implementa feature frontend (asset-management)

Usa l'agente **Asset Frontend Implementer** per implementare la seguente richiesta:

- Feature: {{feature}}
- Pagine coinvolte: {{pagine}}
- Ruoli e permessi richiesti: {{ruoli}}
- Criteri di accettazione: {{criteri}}

Vincoli obbligatori:
1. Riusa componenti/convenzioni esistenti prima di crearne di nuovi.
2. Se manca un componente UI, usa il workflow MCP shadcn (search/view/examples/add command).
3. Usa `useAuth` per i permessi di ruolo.
4. Usa tipi e mock data già presenti (`types.ts`, `mock-data.ts`).
5. Verifica con `npm run lint` e `npm run build` in `asset-management/`.

Output richiesto:
- File modificati
- Componenti shadcn riusati/aggiunti
- Esito lint/build
- Eventuali blocchi/follow-up
