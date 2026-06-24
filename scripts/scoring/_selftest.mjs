// Test runner dei gate hook. Eseguire: node scripts/scoring/_selftest.mjs
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));

function run(script, input, env) {
  const r = spawnSync("node", [join(here, script)], {
    input: JSON.stringify(input),
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
  return (r.stdout || "").trim();
}

const skillPath = { filePath: ".github/skills/seo-audit/SKILL.md" };
const instrPath = {
  filePath: ".github/instructions/secure-development.instructions.md",
};
const appPath = { filePath: "asset-management/src/App.tsx" };

const cases = [
  ["skill LOCKED -> deny atteso", "gate-skills.mjs", { tool_name: "read_file", tool_input: skillPath, session_id: "T" }, { LOCK_SKILLS: "1" }, true],
  ["skill UNLOCKED -> allow atteso", "gate-skills.mjs", { tool_name: "read_file", tool_input: skillPath, session_id: "T" }, { LOCK_SKILLS: "0" }, false],
  ["skill-gate su instr -> allow (non suo compito)", "gate-skills.mjs", { tool_name: "read_file", tool_input: instrPath, session_id: "T" }, { LOCK_SKILLS: "1" }, false],
  ["instr LOCKED -> deny atteso", "gate-instructions.mjs", { tool_name: "read_file", tool_input: instrPath, session_id: "T" }, { LOCK_INSTRUCTIONS: "1" }, true],
  ["instr UNLOCKED -> allow atteso", "gate-instructions.mjs", { tool_name: "read_file", tool_input: instrPath, session_id: "T" }, { LOCK_INSTRUCTIONS: "0" }, false],
  ["non-match -> allow atteso", "gate-skills.mjs", { tool_name: "read_file", tool_input: appPath, session_id: "T" }, { LOCK_SKILLS: "1" }, false],
];

let pass = 0;
for (const [name, script, input, env, expectDeny] of cases) {
  const out = run(script, input, env);
  const denied = out.includes('"permissionDecision":"deny"');
  const ok = denied === expectDeny;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}  (deny=${denied})`);
}
console.log(`\n${pass}/${cases.length} test superati`);
process.exit(pass === cases.length ? 0 : 1);
