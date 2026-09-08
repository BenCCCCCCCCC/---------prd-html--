import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
const manifest = JSON.parse(await readFile("MANIFEST.json", "utf8"));
for (const f of manifest.files.filter((f) =>
  /^(specs|data|design|\.agents)\//.test(f.path),
)) {
  const hash = createHash("sha256")
    .update(await readFile(f.path))
    .digest("hex");
  if (hash !== f.sha256) throw Error("Authoritative input changed: " + f.path);
}
async function files(dir) {
  const all = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.isDirectory()) all.push(...(await files(dir + "/" + e.name)));
    else all.push(dir + "/" + e.name);
  }
  return all;
}
for (const path of await files("src")) {
  if (
    !/\.(ts|tsx)$/.test(path) ||
    path.endsWith(".test.ts") ||
    path.endsWith(".test.tsx")
  )
    continue;
  const text = await readFile(path, "utf8");
  if (
    /\bfetch\s*\(|XMLHttpRequest|sendBeacon|localStorage|dangerouslySetInnerHTML/.test(
      text,
    )
  )
    throw Error(
      "Forbidden runtime network/storage/injection primitive: " + path,
    );
}
console.log(
  "Canonical spec/data/design/skills hashes preserved; no runtime network, localStorage or HTML injection primitive.",
);
