// promote-make-your-own-bounty-x — entry for
// post-x-promote-make-your-own-bounty-01.
// The entry is one X post; this program only hands its address in:
// it reads POST.json from the repository root, checks it names a real
// X post, and copies it byte-for-byte to the output directory.
// The house reads the post itself — nothing written here counts.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = dirname(fileURLToPath(import.meta.url));
const POST_FILE = "POST.json";

// An X post address as X shows it: x.com or twitter.com (www./mobile.
// allowed), /<handle>/status/<digits>; a query or fragment after it
// is read past, so it is accepted and ignored.
const X_POST_URL =
  /^https?:\/\/(www\.|mobile\.)?(x\.com|twitter\.com)\/[A-Za-z0-9_]+\/status\/[0-9]+([/?#].*)?$/;

function loadPost() {
  const raw = readFileSync(join(REPO_ROOT, POST_FILE));
  if (raw.length > 16384) {
    throw new Error(`POST.json is ${raw.length} bytes, over the 16384 limit`);
  }
  const parsed = JSON.parse(raw.toString("utf8"));
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("POST.json must be a JSON object");
  }
  if (typeof parsed.url !== "string" || !X_POST_URL.test(parsed.url)) {
    throw new Error(`POST.json url is not an X post address: ${parsed.url}`);
  }
  return { raw, url: parsed.url };
}

function main() {
  const { raw, url } = loadPost();
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, POST_FILE), raw);
  console.log(`Wrote POST.json (${raw.length} bytes) to ${outDir}`);
  console.log(`Post: ${url}`);
}

main();
