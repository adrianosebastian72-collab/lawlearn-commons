import { cp, mkdir, rm, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "public");
const output = path.join(root, "dist");
const assets = ["index.html", "styles.css", "app.js", "local-study.js", "beta-guide.html", "privacy.html", "robots.txt", "_headers", "lawlearn-commons-source.zip"];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const file of assets) {
  try { await copyFile(path.join(source, file), path.join(output, file)); }
  catch (error) {
    if (file === "lawlearn-commons-source.zip" && error.code === "ENOENT") continue;
    throw error;
  }
}
console.log(`Static beta bundle ready: ${output}`);
console.log("No server, database, AI endpoint or secret key is included.");
