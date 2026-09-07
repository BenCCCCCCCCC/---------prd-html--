import { readFile, writeFile } from "node:fs/promises";
const read = async (p) => JSON.parse(await readFile(p, "utf8"));
const unit = await read("artifacts/reports/unit.json"),
  e2e = await read("artifacts/reports/e2e.json"),
  visual = await read("artifacts/reports/visual.json");
if (!unit.success || e2e.stats.unexpected || visual.stats.unexpected)
  throw Error("Cannot publish passing summary while checks fail");
const result = {
  kind: "executed_local_tests",
  generatedAt: new Date().toISOString(),
  unitPassed: unit.numPassedTests,
  e2ePassed: e2e.stats.expected,
  visualPassed: visual.stats.expected,
  realUsers: "NOT_RUN",
  realModel: "NOT_RUN",
};
await writeFile(
  "src/generated/verification.json",
  JSON.stringify(result, null, 2),
);
const titles = [];
const visit = (s) => {
  for (const spec of s.specs ?? []) titles.push(spec.title);
  for (const sub of s.suites ?? []) visit(sub);
};
visit(e2e);
for (const suite of unit.testResults)
  for (const a of suite.assertionResults)
    if (a.status === "passed") titles.push(a.fullName);
const cases = await read("data/acceptance_cases.json");
const mapping = cases.map((c) => ({
  ...c,
  executionStatus: titles.some((t) => t.includes(c.id)) ? "PASS" : "NOT_RUN",
  actualResult: titles.filter((t) => t.includes(c.id)),
}));
if (mapping.some((c) => c.executionStatus !== "PASS"))
  throw Error("Acceptance mapping incomplete");
await writeFile(
  "artifacts/reports/acceptance-executed.json",
  JSON.stringify(mapping, null, 2),
);
await writeFile(
  "artifacts/reports/verification-summary.json",
  JSON.stringify(result, null, 2),
);
console.log(result);
