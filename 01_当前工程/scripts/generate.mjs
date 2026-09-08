import { readFile, writeFile, mkdir } from "node:fs/promises";
import { compile } from "json-schema-to-typescript";
const read = async (p) => JSON.parse(await readFile(p, "utf8"));
const schema = await read("specs/intent.schema.json");
const request = await read("specs/intent-request.schema.json");
const tokens = await read("specs/design-tokens.json");
const alignment = await read("specs/figma-alignment-tokens.json");
const types = await compile(
  { ...schema, title: "IntentCandidate" },
  "IntentCandidate",
  {
    maxItems: -1,
    bannerComment: "/* Generated from canonical schema. Do not edit. */",
  },
);
const requests = await compile(
  { ...request, title: "IntentRequest" },
  "IntentRequest",
  {
    maxItems: -1,
    bannerComment: "/* Generated from canonical request schema. */",
  },
);
const vars = [];
for (const [k, v] of Object.entries(tokens.color)) vars.push(`--${k}: ${v};`);
for (const [k, v] of Object.entries(tokens.font))
  vars.push(`--font-${k}: ${v};`);
for (const n of tokens.spacePx) vars.push(`--s${n}: ${n / 16}rem;`);
for (const [k, [size, line]] of Object.entries(tokens.typePx))
  vars.push(`--type-${k}: ${size / 16}rem; --leading-${k}: ${line / 16}rem;`);
for (const [k, v] of Object.entries(tokens.radiusPx))
  vars.push(`--radius-${k}: ${v}px;`);
for (const [k, v] of Object.entries(tokens.layout))
  if (typeof v === "number")
    vars.push(
      `--layout-${k}: ${k.includes("Ratio") || k.includes("Alpha") ? v : v + "px"};`,
    );
for (const [k, v] of Object.entries(tokens.motionMs))
  vars.push(`--motion-${k}: ${v}ms;`);
const outputs = {
  "src/generated/alignment-tokens.css": `/* Generated from specs/figma-alignment-tokens.json. */\n:root {\n${Object.entries(
    alignment.values,
  )
    .map(([k, v]) => `--align-${k}: ${v};`)
    .join("\n")}\n}\n`,
  "src/generated/intent-schema.d.ts": types,
  "src/generated/intent-request.d.ts": requests,
  "src/generated/tokens.css": `/* Generated from specs/design-tokens.json. */\n:root {\n${vars.join("\n")}\n}\n`,
};
await mkdir("src/generated", { recursive: true });
for (const [path, content] of Object.entries(outputs)) {
  if (process.argv.includes("--check")) {
    if ((await readFile(path, "utf8").catch(() => "")) !== content)
      throw new Error(`Generated drift: ${path}`);
  } else await writeFile(path, content);
}
console.log(
  process.argv.includes("--check")
    ? "Generated files match schemas/tokens"
    : "Generated schema types and tokens",
);
