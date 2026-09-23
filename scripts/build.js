import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const entry of [
  "index.html",
  "in-development.html",
  "styles.css",
  "in-development.css",
  "script.js",
  "in-development.js",
  "assets",
]) {
  await cp(join(root, entry), join(dist, entry), { recursive: true });
}

console.log("Built static site to dist/");
