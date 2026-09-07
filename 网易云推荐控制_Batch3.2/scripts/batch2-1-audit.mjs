import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
const root = process.cwd();
const backup = path.resolve(root, "../Batch2.1_备份_修改前");
async function walk(dir) {
  const result = [];
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) result.push(...(await walk(full)));
    else result.push(full);
  }
  return result;
}
const hash = async (file) =>
  createHash("sha256")
    .update(await readFile(file))
    .digest("hex");
const immutable = [
  "src/domain/model.ts",
  "src/domain/ai.ts",
  "src/storage.ts",
  "src/Portfolio.tsx",
  "src/components.tsx",
  "src/styles.css",
  "tests/e2e/flows.spec.ts",
  "tests/e2e/recovery.spec.ts",
  "pnpm-lock.yaml",
];
const unchanged = [];
for (const file of immutable) {
  const before = await hash(path.join(backup, file));
  const after = await hash(path.join(root, file));
  if (before !== after) throw Error(`Unexpected protected change: ${file}`);
  unchanged.push({ file, before, after, status: "UNCHANGED" });
}
const changes = [];
for (const folder of ["src", "tests", "scripts", "docs", "qa"]) {
  for (const full of await walk(path.join(root, folder))) {
    if (full.includes("-snapshots")) continue;
    const file = path.relative(root, full).replaceAll("\\", "/");
    const after = await hash(full);
    let before = null;
    try {
      before = await hash(path.join(backup, file));
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    if (before !== after)
      changes.push({
        file,
        before,
        after,
        kind: before ? "MODIFIED" : "ADDED",
      });
  }
}
const snapshots = await walk(
  path.join(root, "tests/visual/screens.spec.ts-snapshots"),
);
const candidate = snapshots.filter(
  (p) => p.includes("batch2.1-candidate") && p.endsWith(".png"),
);
const legacy = snapshots.filter(
  (p) => !p.includes("batch2.1-candidate") && p.endsWith(".png"),
);
if (candidate.length !== 64 || legacy.length !== 64)
  throw Error("Expected 64 legacy + 64 candidate screenshots");
for (const full of legacy) {
  const file = path.relative(root, full);
  if ((await hash(full)) !== (await hash(path.join(backup, file))))
    throw Error(`Legacy snapshot changed: ${file}`);
}
const publicFiles = await walk(path.join(root, "public")).catch((error) => {
  if (error.code === "ENOENT") return [];
  throw error;
});
const runtime = [...(await walk(path.join(root, "dist"))), ...publicFiles];
const forbidden = runtime.filter((p) =>
  /\.(png|jpg|jpeg|webp|woff2?|ttf|otf)$/i.test(p),
);
if (forbidden.length)
  throw Error(`Unexpected raster/font runtime files: ${forbidden.join(", ")}`);
await writeFile(
  "artifacts/batch2.1/change-audit.json",
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      unchanged,
      changes,
      note: "Source/docs/tests/scripts audit against pre-change copy; artifact and package inventory is in delivery checksum JSON. Original specification hashes are checked by scripts/invariants.mjs.",
      legacyScreenshots: legacy.length,
      legacyHashes: "UNCHANGED",
      candidateScreenshots: candidate.length,
      runtimeRasterAndFonts: "NONE",
      ownerBaselineApproval: "PENDING",
    },
    null,
    2,
  ),
);
console.log(
  `PASS: ${unchanged.length} protected files, 64 unchanged legacy screenshots, 64 candidates; ${changes.length} source/report changes.`,
);
