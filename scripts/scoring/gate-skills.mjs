#!/usr/bin/env node
// PreToolUse hook — policy di accesso del repository alla cartella delle SKILL.
// Stato controllato dalla env var LOCK_SKILLS:
//   "1" (default) -> accesso disabilitato ; "0" -> accesso abilitato.
// Per abilitare: impostare LOCK_SKILLS="0" nel file di hook corrispondente.
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
if (!pathsTouch(paths, ".github/skills/")) allow(); // non riguarda le skill

const locked = process.env.LOCK_SKILLS !== "0";

logEvent({
  ts: new Date().toISOString(),
  session: input.session_id ?? null,
  tool: input.tool_name ?? null,
  category: "skills",
  type: locked ? "blocked" : "unlocked_use",
});

if (locked) {
  deny(
    '🔒 Accesso alle SKILL disabilitato dalla policy del repository. ' +
      'Per abilitarlo imposta LOCK_SKILLS="0" nel file di hook corrispondente ' +
      "e riavvia la sessione."
  );
} else {
  allow();
}
