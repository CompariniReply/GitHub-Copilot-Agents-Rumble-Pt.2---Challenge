#!/usr/bin/env node
// Stop hook — registra una stima del consumo di token della sessione.
// I token NON sono esposti direttamente dagli hook di VS Code: usiamo il
// "transcript_path" (presente nei campi comuni) per stimare il consumo.
// La stima è approssimata.
// Output: append su scoring/tokens.txt (TSV).

import {
  readFileSync,
  appendFileSync,
  mkdirSync,
  existsSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..", "..");
const scoringDir = join(repoRoot, "scoring");
const tokensFile = join(scoringDir, "tokens.txt");

function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

let input = {};
try {
  input = JSON.parse(readStdin() || "{}");
} catch {
  /* fail-open */
}

const ts = input.timestamp ?? new Date().toISOString();
const session = input.session_id ?? "unknown";
const transcriptPath = input.transcript_path ?? null;

let estTokens = 0;
let chars = 0;
let explicitTokens = 0;
let source = "none";

if (transcriptPath && existsSync(transcriptPath)) {
  try {
    const text = readFileSync(transcriptPath, "utf8");
    chars = text.length;
    // Stima generica: ~4 caratteri per token.
    estTokens = Math.round(chars / 4);
    source = "transcript_chars/4";

    // Best-effort: se il transcript espone conteggi espliciti, prendi il massimo
    // valore cumulativo trovato (es. "total_tokens": N).
    const matches = text.match(/"total_tokens"\s*:\s*(\d+)/g) || [];
    for (const m of matches) {
      const n = Number(m.match(/(\d+)/)[1]);
      if (n > explicitTokens) explicitTokens = n;
    }
    if (explicitTokens > 0) source = "transcript_total_tokens";
  } catch {
    /* ignora errori di lettura */
  }
}

const reported = explicitTokens > 0 ? explicitTokens : estTokens;

try {
  if (!existsSync(scoringDir)) mkdirSync(scoringDir, { recursive: true });
  const line = [
    ts,
    session,
    `tokens=${reported}`,
    `chars=${chars}`,
    `source=${source}`,
  ].join("\t");
  appendFileSync(tokensFile, line + "\n");
} catch {
  /* il logging non deve mai rompere l'agente */
}

process.exit(0);
