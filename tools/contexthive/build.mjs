// Bundles ContextHive (the SDK, its built-in UI and the Cloud adapter) into ../../contexthive/, from
// a checkout of https://github.com/free-solo/contexthive that has been built (`pnpm install && pnpm
// build`). The packages are not on npm yet; once they are, this can import them from there.
//
//   node tools/contexthive/build.mjs ../contexthive
import { execFileSync } from "node:child_process";
import { rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const repo = resolve(process.argv[2] ?? "../contexthive");
const out = here("../../contexthive");
const { build } = createRequire(resolve(repo, "packages/sdk/package.json"))("rolldown");
const pkg = (p) => resolve(repo, "packages", p);

await rm(out, { recursive: true, force: true });
await build({
  input: { contexthive: here("entry.js") },
  platform: "browser",
  treeshake: true,
  resolve: {
    alias: {
      "contexthive-sdk/ui": pkg("sdk/dist/ui/index.js"),
      "contexthive-sdk": pkg("sdk/dist/index.js"),
      "contexthive-adapter-cloud/sign-in": pkg("adapter-cloud/dist/sign-in.js"),
      "contexthive-adapter-cloud": pkg("adapter-cloud/dist/index.js"),
    },
  },
  output: {
    dir: out,
    format: "esm",
    minify: true,
    comments: false,
    chunkFileNames: "chunks/[name]-[hash].js",
  },
});
const commit = execFileSync("git", ["-C", repo, "rev-parse", "--short", "HEAD"], { encoding: "utf8" }).trim();
await writeFile(resolve(out, "VERSION"), `free-solo/contexthive ${commit}\n`);
console.log(`contexthive/ built from ${repo} at ${commit}`);
