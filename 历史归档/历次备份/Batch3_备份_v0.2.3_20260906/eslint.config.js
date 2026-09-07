import js from "@eslint/js";
import ts from "typescript-eslint";
export default ts.config(
  { ignores: ["src/generated/**"] },
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    languageOptions: {
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        URL: "readonly",
        document: "readonly",
        innerWidth: "readonly",
        matchMedia: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
    },
  },
);
