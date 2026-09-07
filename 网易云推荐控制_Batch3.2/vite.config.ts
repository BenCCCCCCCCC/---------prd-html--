import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
export default defineConfig({
  base: "./",
  plugins: [react()],
  // Word/PDF QA artifacts are not app inputs; native Office locks its temporary files.
  server: { watch: { ignored: ["**/artifacts/**"] } },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
    environment: "jsdom",
    reporters: ["default", "json"],
    outputFile: "artifacts/reports/unit.json",
  },
});
