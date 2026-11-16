import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");

test("public beta clearly states AI is disabled", async () => {
  const html = await readFile(path.join(publicDir, "index.html"), "utf8");
  const js = await readFile(path.join(publicDir, "app.js"), "utf8");
  assert.match(html, /AI is deliberately switched off|No AI is active in this beta/);
  assert.match(js, /AI is intentionally disabled in this beta/);
  assert.doesNotMatch(js, /fetch\(["']\/api\/ai/);
});

test("beta privacy and tester guide are present", async () => {
  await access(path.join(publicDir, "privacy.html"));
  await access(path.join(publicDir, "beta-guide.html"));
  await access(path.join(publicDir, "_headers"));
});

test("public beta does not include third-party AI credentials", async () => {
  const app = await readFile(path.join(publicDir, "app.js"), "utf8");
  assert.doesNotMatch(app, /ANTHROPIC_API_KEY|OPENAI_API_KEY|GEMINI_API_KEY|TOGETHER_API_KEY/);
});
