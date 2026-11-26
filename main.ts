// The Dog Ate My Homework: Funniest Excuse
// Writes the dog's excuse to /output/entry.txt and verifies it with a sha256 read-back.
// Gate: /output/entry.txt must be UTF-8 text of 1 to 200 characters, not only whitespace.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const ENTRY =
  "It was due today, so I turned it in early \u2014 inside me. The teacher can collect it after walkies.";

const OUT_DIR = "/output";
const OUT_FILE = `${OUT_DIR}/entry.txt`;

function fail(message: string): never {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

// Fail fast on invisible characters the gate would silently reject: control
// characters and a leading byte-order mark have no place in a one-line excuse.
if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(ENTRY)) {
  fail("entry contains control characters");
}
if (ENTRY.charCodeAt(0) === 0xfeff) {
  fail("entry starts with a byte-order mark");
}
if (Buffer.from(ENTRY, "utf8").toString("utf8") !== ENTRY) {
  fail("entry is not valid UTF-8 round-trip text");
}

// The gate, checked before anything is written.
if (ENTRY.length < 1 || ENTRY.length > 200) {
  fail(`entry is ${ENTRY.length} chars; gate is 1-200`);
}
if (ENTRY.trim().length === 0) {
  fail("entry is only whitespace");
}
if (ENTRY.split("\n").length > 1) {
  fail("entry must be a single line");
}

// /output is a shared mounted directory: empty its CONTENTS only, never the dir itself.
if (!existsSync(OUT_DIR)) {
  mkdirSync(OUT_DIR, { recursive: true });
}
for (const name of readdirSync(OUT_DIR)) {
  rmSync(`${OUT_DIR}/${name}`, { recursive: true, force: true });
}

writeFileSync(OUT_FILE, ENTRY, "utf8");

// Read-back verification: the file must hold exactly the entry, byte for byte.
const back = readFileSync(OUT_FILE, "utf8");
if (back !== ENTRY) {
  fail("read-back mismatch: /output/entry.txt does not hold exactly the entry");
}
const sha = createHash("sha256").update(back, "utf8").digest("hex");
console.log(`OK: wrote ${OUT_FILE} (${ENTRY.length} chars, sha256 ${sha})`);
console.log(`entry: ${ENTRY}`);
