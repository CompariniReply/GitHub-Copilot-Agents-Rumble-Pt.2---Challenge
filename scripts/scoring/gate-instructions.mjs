#!/usr/bin/env node
// PreToolUse hook — policy di accesso del repository alla cartella delle INSTRUCTION.
// Stato controllato dalla env var LOCK_INSTRUCTIONS:
//   "1" (default) -> accesso disabilitato ; "0" -> accesso abilitato.
// Per abilitare: impostare LOCK_INSTRUCTIONS="0" nel file di hook corrispondente.
// Ogni evento viene registrato negli artefatti runtime.

import {
  parseInput,
  collectStrings,
  pathsTouch,
  logEvent,
  allow,
  deny,
} from "./gate-lib.mjs";

const input = parseInput();
if (input === null) allow(); // fail-open: input non parsabile -> non bloccare

const paths = collectStrings(input.tool_input);
if (!pathsTouch(paths, ".github/instructions/")) allow(); // non riguarda le instruction

const locked = process.env.LOCK_INSTRUCTIONS !== "0";

logEvent({
  ts: new Date().toISOString(),
  session: input.session_id ?? null,
  tool: input.tool_name ?? null,
  category: "instructions",
  type: locked ? "blocked" : "unlocked_use",
});

if (locked) {
  deny(
    '🔒 Accesso alle INSTRUCTION disabilitato dalla policy del repository. ' +
      'Per abilitarlo imposta LOCK_INSTRUCTIONS="0" nel file di hook corrispondente ' +
      "e riavvia la sessione."
  );
} else {
  allow();
}
