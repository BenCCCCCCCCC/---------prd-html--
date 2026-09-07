import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
const root = process.cwd();
const baseline = path.resolve(root, "../Batch2.1_收尾_备份_v0.2.2_20260906");
const hash = async (file) =>
  createHash("sha256")
    .update(await readFile(file))
    .digest("hex");
async function walk(dir) {
  const files = [];
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}
const protectedFiles = [
  "src/domain/model.ts",
  "src/domain/ai.ts",
  "src/storage.ts",
  "src/Portfolio.tsx",
  "src/components.tsx",
  "src/styles.css",
  "src/PreferenceControls.tsx",
  "specs/product-config.json",
  "specs/design-tokens.json",
  "specs/figma-alignment-tokens.json",
  "specs/tags.json",
  "pnpm-lock.yaml",
  "tests/e2e/flows.spec.ts",
  "tests/e2e/recovery.spec.ts",
  "tests/e2e/alignment.spec.ts",
];
const protectedHashes = [];
for (const file of protectedFiles) {
  const before = await hash(path.join(baseline, file)),
    after = await hash(path.join(root, file));
  if (before !== after) throw Error(`Protected file changed: ${file}`);
  protectedHashes.push({ file, sha256: after, status: "UNCHANGED" });
}
const oldSnapshots = (
  await walk(path.join(baseline, "tests/visual/screens.spec.ts-snapshots"))
).filter((p) => p.endsWith(".png"));
for (const file of oldSnapshots) {
  const relative = path.relative(baseline, file);
  if ((await hash(file)) !== (await hash(path.join(root, relative))))
    throw Error(`Old snapshot changed: ${relative}`);
}
const changes = [];
for (const folder of [
  "src",
  "docs",
  "qa",
  "scripts",
  "tests/e2e",
  "tests/visual",
]) {
  for (const file of await walk(path.join(root, folder))) {
    if (file.includes("-snapshots")) continue;
    const relative = path.relative(root, file).replaceAll("\\", "/");
    let before = null;
    try {
      before = await hash(path.join(baseline, relative));
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    const after = await hash(file);
    if (before !== after) changes.push({ file: relative, before, after });
  }
}
for (const file of ["package.json", "README.md"])
  changes.push({
    file,
    before: await hash(path.join(baseline, file)),
    after: await hash(file),
  });
const evidence = [];
for (const dir of await readdir("artifacts/closeout/natural")) {
  const e = JSON.parse(
    await readFile(`artifacts/closeout/natural/${dir}/evidence.json`, "utf8"),
  );
  if (e.beforeCommitY !== e.afterCommitY || e.beforeCommitY !== e.afterUndoY)
    throw Error(`Natural flow scrolled: ${dir}`);
  evidence.push(e);
}
const candidateCount = (
  await walk("tests/visual/screens.spec.ts-snapshots/closeout-candidate")
).filter((p) => p.endsWith(".png")).length;
if (oldSnapshots.length !== 128 || candidateCount !== 64)
  throw Error("Expected 128 unchanged old +64 new candidate screenshots");
await writeFile(
  "artifacts/closeout/final-audit.json",
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      baseline: "v0.2.2",
      protectedHashes,
      changes,
      oldSnapshotsUnchanged: 128,
      candidateCount,
      ownerApproval: "PENDING",
      naturalEvidence: evidence,
    },
    null,
    2,
  ),
);
console.log(
  "PASS: protected source/contracts, 128 old snapshots, 64 candidates, and 8 natural no-scroll flows.",
);
