# Artefatti di runtime

Questa cartella raccoglie file generati automaticamente durante le sessioni agente
(vedi `.gitignore`). Non vanno versionati e non contengono materiale rilevante per chi
sviluppa la challenge.

## Compatibilità (Windows / macOS / Linux)

Gli hook in [`.github/hooks/`](../.github/hooks/) eseguono script **Node.js**
(`node scripts/scoring/*.mjs`): usano solo API standard di Node (`node:fs`, `node:path`)
e quindi funzionano **identici su Windows, macOS e Linux**. Non esistono script specifici
per un singolo sistema operativo.

> Nota per macOS/Linux: assicurati che `node` sia raggiungibile dal `PATH` nella shell non
> interattiva usata dagli hook. Se usi `nvm`, può essere utile installare anche una versione
> di Node a livello di sistema (es. tramite Homebrew) così che gli hook la trovino sempre.

## Reset

**macOS / Linux** (bash/zsh):

```bash
rm -f scoring/events.jsonl scoring/tokens.txt
```

**Windows** (PowerShell):

```powershell
Remove-Item scoring/events.jsonl, scoring/tokens.txt -ErrorAction SilentlyContinue
```

