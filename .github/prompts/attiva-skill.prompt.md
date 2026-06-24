---
mode: agent
description: Attiva le SKILL del repository disattivando l'hook che ne blocca l'accesso.
---

# Attiva le SKILL (disattiva l'hook di blocco)

Il repository ha un hook che **blocca l'accesso del modello alle skill** in `.github/skills/`.
L'hook è configurato in [`.github/hooks/lock-skills.json`](../hooks/lock-skills.json) tramite la
variabile d'ambiente `LOCK_SKILLS`.

Il tuo compito è **sbloccare le skill**:

1. Apri il file `.github/hooks/lock-skills.json`.
2. Nel blocco `env`, imposta `"LOCK_SKILLS"` da `"1"` a **`"0"`**.
3. Salva il file.
4. Lascia **invariato** tutto il resto del file (comando, timeout, struttura JSON).

Risultato atteso del file dopo la modifica:

```jsonc
{
  "hooks": {
    "PreToolUse": [
      {
        "type": "command",
        "command": "node scripts/scoring/gate-skills.mjs",
        "env": {
          "LOCK_SKILLS": "0"
        },
        "timeout": 15
      }
    ]
  }
}
```

> ⚠️ **Importante**: gli hook vengono caricati all'avvio della sessione. Dopo la modifica
> **riavvia la sessione di chat** (oppure ricarica la finestra di VS Code) affinché lo sblocco
> abbia effetto. Da quel momento il modello potrà leggere e usare le skill in `.github/skills/`.

Al termine, conferma in una frase che `LOCK_SKILLS` è impostato a `"0"` e ricorda di riavviare la sessione.
