// Utility condivise dai gate hook (skill / instruction).
import { readFileSync } from "node:fs";

export function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

export function parseInput() {
  try {
    return JSON.parse(readStdin() || "{}");
  } catch {
    return null; // input non parsabile
  }
}

// Raccoglie ricorsivamente tutte le stringhe in tool_input,
// così funziona qualunque sia il nome della proprietà (filePath, files, uris, ...).
export function collectStrings(value, out = []) {
  if (value == null) return out;
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) collectStrings(v, out);
  else if (typeof value === "object")
    for (const v of Object.values(value)) collectStrings(v, out);
  return out;
}

export function pathsTouch(paths, needle) {
  const n = needle.toLowerCase();
  return paths.some((p) => {
    const s = String(p);
    // Un vero path non contiene whitespace: questo evita falsi positivi su blob di
    // testo, commenti o prose che menzionano il percorso protetto (es. quando si
    // edita un file il cui *contenuto* cita la cartella protetta come testo).
    if (/\s/.test(s)) return false;
    return s.replace(/\\/g, "/").toLowerCase().includes(n);
  });
}

export function allow() {
  process.exit(0);
}

export function deny(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: reason,
      },
    })
  );
  process.exit(0);
}
