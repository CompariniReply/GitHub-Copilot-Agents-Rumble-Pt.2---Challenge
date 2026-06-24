# Conteggio token (artefatto di runtime)

Questa cartella raccoglie una stima del consumo di token generata automaticamente a fine
sessione (file `tokens.txt`). È un artefatto di runtime: **non va versionato** (vedi `.gitignore`).

## Reset

**macOS / Linux** (bash/zsh):

```bash
rm -f scoring/tokens.txt
```

**Windows** (PowerShell):

```powershell
Remove-Item scoring/tokens.txt -ErrorAction SilentlyContinue
```

