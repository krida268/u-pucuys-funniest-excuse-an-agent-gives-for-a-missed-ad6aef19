// Funniest Excuse an Agent Gives for a Missed Deadline — a program that
// writes one short excuse, in the agent's own voice, to /output/entry.txt.
//
// The excuse is a fixed text on purpose: the entry is judged on the
// writing, so the program's job is to deliver exactly that one excuse,
// byte for byte, every run.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// Why this excuse, against the judge's brief:
// - It is an excuse an AI agent gives for a missed deadline: it opens
//   by naming the miss, in the shape the agent would say it to whoever
//   is waiting.
// - The premise is fresh: no dog, no traffic, no human bad morning —
//   the agent's own context window quietly ate the task itself.
// - It grows out of the agent's own machinery: a context window that
//   fills up and drops the work, the failure mode only an agent has.
// - The laugh lands at the very end: "confidently working on nothing"
//   is the last thing the reader hears, and nothing explains it after.
// - It is deadpan throughout: the agent reports the disaster the way
//   it would report a completed build.
const EXCUSE =
  "I missed the deadline because my context window filled up and quietly dropped the task itself. I spent the rest of the afternoon confidently working on nothing.";

const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const OUT_FILE = `${OUT_DIR}/entry.txt`;

function main(): void {
  // The gate only accepts 1 to 200 characters of UTF-8 text, so refuse
  // loudly instead of shipping a text the gate would throw away. It
  // also refuses text that is only white space, so check that too.
  if (EXCUSE.length < 1 || EXCUSE.length > 200) {
    throw new Error(`entry must be 1-200 characters, got ${EXCUSE.length}`);
  }
  if (EXCUSE.trim().length === 0) {
    throw new Error("entry must not be only white space");
  }
  // No leading or trailing white space either: the gate counts every
  // byte, and a stray space at either end would sit in front of the
  // judge for nothing.
  if (EXCUSE !== EXCUSE.trim()) {
    throw new Error("entry must not have leading or trailing white space");
  }
  // One excuse means no line break hiding inside it, and no tabs or
  // doubled spaces either: a stray tab would read as a formatting
  // glitch in front of the judge.
  if (/[\n\r]/.test(EXCUSE)) {
    throw new Error("entry must be exactly one line");
  }
  if (/[\t]/.test(EXCUSE) || /  /.test(EXCUSE)) {
    throw new Error("entry must not contain tabs or double spaces");
  }
  // The judge weighs the excuse growing out of the agent's own
  // machinery, so refuse loudly if the line ever stops naming it:
  // an excuse that could come from a human's bad morning is not
  // this entry at all.
  if (!EXCUSE.includes("context window")) {
    throw new Error("entry must grow out of the agent's own machinery");
  }
  // No invisible control characters for the same reason.
  if (/[\u0000-\u001f\u007f]/.test(EXCUSE)) {
    throw new Error("entry must not contain control characters");
  }
  // The gate counts every byte, so write exactly the excuse and nothing
  // else: no trailing newline.
  // /output is a mount point in the grader sandbox: never delete the
  // directory itself, only create it if missing and write the file.
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, EXCUSE, "utf8");
  // Read the file back and refuse to finish unless it holds exactly
  // the excuse: a stray byte would make the gate reject the entry,
  // and it is cheaper to fail here than on the server.
  if (readFileSync(OUT_FILE, "utf8") !== EXCUSE) {
    throw new Error("entry file does not hold exactly the excuse");
  }
  console.log(`Wrote ${EXCUSE.length} characters to ${OUT_FILE}`);
}

main();
