---
mode: agent
description: Attiva le INSTRUCTION del repository disattivando l'hook che ne blocca l'accesso.
---

# Attiva le INSTRUCTION (disattiva l'hook di blocco)

Il repository ha un hook che **blocca l'accesso del modello alle instruction** in
`.github/instructions/`. L'hook è configurato in
[`.github/hooks/lock-instructions.json`](../hooks/lock-instructions.json) tramite la
variabile d'ambiente `LOCK_INSTRUCTIONS`.

Il tuo compito è **sbloccare le instruction**:

1. Apri il file `.github/hooks/lock-instructions.json`.
2. Nel blocco `env`, imposta `"LOCK_INSTRUCTIONS"` da `"1"` a **`"0"`**.
3. Salva il file.
4. Lascia **invariato** tutto il resto del file (comando, timeout, struttura JSON).

Risultato atteso del file dopo la modifica:

```jsonc
{
  "hooks": {
    "PreToolUse": [
      {
        "type": "command",
        "command": "node scripts/scoring/gate-instructions.mjs",
        "env": {
          "LOCK_INSTRUCTIONS": "0"
        },
        "timeout": 15
      }
    ]
  }
}
```

> ⚠️ **Importante**: gli hook vengono caricati all'avvio della sessione. Dopo la modifica
> **riavvia la sessione di chat** (oppure ricarica la finestra di VS Code) affinché lo sblocco
> abbia effetto. Da quel momento il modello potrà leggere e usare le instruction in
> `.github/instructions/`.

Al termine, conferma in una frase che `LOCK_INSTRUCTIONS` è impostato a `"0"` e ricorda di riavviare la sessione.
