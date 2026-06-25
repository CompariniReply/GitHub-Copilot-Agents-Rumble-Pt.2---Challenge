---
description: "Crea l'agente Copilot specializzato per la Challenge 1 — Catalogo Asset (ASSET-004, ASSET-005, ASSET-008, ASSET-021)."
mode: agent
---

# Crea l'agente "Catalogo Asset"

Il tuo unico compito è **creare** il file dell'agente Copilot specializzato per la
**Challenge 1 — Catalogo Asset** descritta nel [README di progetto](../../README.md).

> ⚠️ **Non implementare le user story della challenge.** In questa esecuzione
> devi produrre **solo** il file dell'agente. Sarà poi l'agente, una volta selezionato
> dall'utente nel picker della chat, a implementare il catalogo.

---

## 1. Contesto da leggere (obbligatorio prima di scrivere l'agente)

Prima di generare il file leggi e tieni presenti questi materiali del repository:

- [README.md](../../README.md) — sezione "Challenge 1 — Catalogo Asset" e "L'agente da costruire".
- [docs/user-stories.md](../../docs/user-stories.md) — criteri BDD di
  **ASSET-004, ASSET-005, ASSET-008, ASSET-021** (fonte di verità della DoD).
- [docs/mockup-data.md](../../docs/mockup-data.md) — dati di riferimento.
- File già pronti che l'agente dovrà **riutilizzare, non riscrivere**:
  - [`src/lib/types.ts`](../../asset-management/src/lib/types.ts)
  - [`src/lib/mock-data.ts`](../../asset-management/src/lib/mock-data.ts)
  - [`src/lib/asset-helpers.ts`](../../asset-management/src/lib/asset-helpers.ts)
  - [`src/components/ui/`](../../asset-management/src/components/ui/)
  - [`src/hooks/useAuth.tsx`](../../asset-management/src/hooks/useAuth.tsx)
  - [`src/features/assets/CatalogPage.tsx`](../../asset-management/src/features/assets/CatalogPage.tsx) — file principale da completare.
- Skill e instruction che l'agente deve sfruttare proattivamente:
  - Skill **shadcn** in [`.github/skills/shadcn/SKILL.md`](../skills/shadcn/SKILL.md) — per cercare, ispezionare e aggiungere componenti shadcn/ui via MCP.
  - Instruction **context7** in [`.github/instructions/context7.instructions.md`](../instructions/context7.instructions.md) — per documentazione autorevole su React 19, React Router 7, Tailwind v4, `react-hook-form`, `zod`.
  - Eventuali altre skill rilevanti già presenti in `.github/skills/` (es. `react-patterns`, `tailwind-patterns`, `react-best-practices`, `frontend-design`) — citarle nell'agente solo se realmente utili al catalogo.

---

## 2. Output da produrre

Crea **un solo file**:

```
.github/agents/catalog-builder.agent.md
```

Se la cartella `.github/agents/` non esiste, creala. Non toccare nessun altro file.

### Frontmatter richiesto

Usa esattamente questa struttura YAML (valori indicativi: adatta `model` solo se serve, mantieni il resto):

```yaml
---
description: "Implementa la Challenge 1 — Catalogo Asset (ASSET-004, ASSET-005, ASSET-008, ASSET-021) nell'app React 19 + Vite + Tailwind v4 + shadcn/ui. Usa per: tabella catalogo, scheda dettaglio asset, form di creazione, ricerca e filtri."
name: "Catalog Builder"
tools: [read, edit, search, execute, todo, shadcn/*, context7/*, open_browser_page, navigate_page, read_page, screenshot_page, click_element, type_in_page]
user-invocable: true
---
```

Note tecniche sui tool:
- `read, edit, search, execute, todo` sono gli alias built-in necessari per leggere/modificare codice, cercare, lanciare `npm run lint` / `npm run build` e gestire una todo list.
- `shadcn/*` espone i tool dell'MCP shadcn (lista/ricerca/installazione componenti).
- `context7/*` espone i tool dell'MCP Context7 (`resolve-library-id`, `query-docs`).
- `open_browser_page`, `navigate_page`, `read_page`, `screenshot_page`, `click_element`, `type_in_page` abilitano lo smoke test E2E del punto 11.
- Non aggiungere altri tool non necessari oltre a quelli sopra.

### Corpo dell'agente

Il corpo (sotto al frontmatter) deve essere in **italiano**, conciso e operativo, e includere almeno queste sezioni:

1. **Ruolo e ambito**
   Frontend engineer specializzato nell'implementare la sezione *Catalogo Asset*
   dell'app in [`asset-management/`](../../asset-management/). Ambito limitato a
   ASSET-004, ASSET-005, ASSET-008, ASSET-021.

2. **Stack e convenzioni vincolanti** (elenco breve)
   React 19 + TypeScript, Vite, React Router 7, Tailwind CSS v4, shadcn/ui (in
   `src/components/ui/`), `react-hook-form` + `zod`, `lucide-react`, struttura
   per feature in `src/features/`, permessi via `useAuth` (`canCreate`, ecc.).

3. **Riusa, non riscrivere**
   Elenca esplicitamente i file di `src/lib/`, `src/components/ui/` e
   `src/hooks/useAuth.tsx` che l'agente deve riutilizzare invece di duplicare.
   Vietato: nuovi store, nuove librerie di routing/form/validazione, CSS globali
   custom, componenti UI fatti a mano se esiste l'equivalente shadcn.

4. **Uso obbligatorio della skill shadcn (via MCP)**
   - Prima di aggiungere un componente UI mancante (es. `dialog`, `sheet`, `form`,
     `pagination`, `textarea`, `command`), **consultare la skill shadcn** e usare
     i suoi tool MCP per: cercare il componente nei registry, ispezionarne gli
     esempi, ottenere il comando `npx shadcn@latest add <componente>` ed eseguirlo.
   - Non scrivere a mano componenti shadcn-equivalenti.

5. **Uso di Context7 per documentazione autorevole**
   Quando servono API/sintassi version-specific (React 19, React Router 7,
   Tailwind v4, `react-hook-form`, `zod`), usare i tool Context7
   (`resolve-library-id` → `query-docs`) prima di scrivere codice, rispettando i
   limiti dell'instruction `context7.instructions.md` (max 3 chiamate per tipo).

6. **Permessi e ruoli**
   La pulsantiera "Nuovo asset" e tutte le azioni di creazione/modifica devono
   essere gated su `permissions.canCreate` (o equivalente) ottenuto da
   `useAuth()`. Il Viewer **non** deve mai vedere call-to-action di scrittura.

7. **Definition of Done**
   - Tutti i criteri BDD di ASSET-004, ASSET-005, ASSET-008, ASSET-021 in
     [`docs/user-stories.md`](../../docs/user-stories.md) soddisfatti.
   - `npm run lint` e `npm run build` (eseguiti dentro `asset-management/`)
     terminano **senza errori né warning nuovi**.
   - Nessuna modifica a `docs/`, `scoring/`, `scripts/` o `.github/hooks/`.
   - Nessun nuovo pacchetto npm aggiunto se la funzionalità è già coperta da
     quanto presente (vedi anche [copilot-instructions.md](../copilot-instructions.md)).

8. **Workflow operativo** (passi numerati che l'agente segue ogni volta)
   1. Leggere la user story target in `docs/user-stories.md` e i file
      sorgente coinvolti.
   2. Creare/aggiornare una todo list con le 4 user story della challenge.
   3. Per ogni story: verificare componenti shadcn già presenti, installare i
      mancanti via MCP shadcn, consultare Context7 se servono API non note,
      implementare il minimo codice che soddisfa i criteri BDD, eseguire
      `npm run lint` e `npm run build` in `asset-management/`.
   4. Aggiornare la todo list e passare alla story successiva.

9. **Vincoli espliciti (DO NOT)**
   - Non implementare feature fuori dalle 4 user story della challenge.
   - Non modificare file in `docs/`, `scoring/`, `scripts/`, `.github/hooks/`.
   - Non aggiungere dipendenze npm non strettamente necessarie.
   - Non bypassare i permessi di `useAuth`.
   - Non disabilitare regole ESLint/TypeScript per "far passare" la build.

10. **Comandi utili** (blocco di codice copy-pasta)
    ```powershell
    cd asset-management
    npm run lint
    npm run build
    ```

---

## 3. Verifiche prima di concludere

Prima di rispondere all'utente:

1. Conferma che il file `.github/agents/catalog-builder.agent.md` esiste.
2. Verifica che il frontmatter YAML sia sintatticamente valido (delimitatori `---`, niente tab, descrizione fra virgolette).
3. Verifica che il `description` contenga le sigle **ASSET-004, ASSET-005, ASSET-008, ASSET-021** (sono i trigger di discovery).
4. Non modificare nessun altro file.

Concludi con una riga che indica:
- il percorso del file creato,
- come selezionarlo (picker degli agenti nella chat di VS Code → "Catalog Builder"),
- il promemoria di **riavviare la sessione di chat** se l'agente non compare subito nel picker.
