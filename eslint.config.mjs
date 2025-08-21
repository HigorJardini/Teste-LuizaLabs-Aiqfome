import { defineConfig } from "eslint/config";
import eslintPluginImport from "eslint-plugin-import";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import parser from "@typescript-eslint/parser";
import globals from "globals";

export default defineConfig([
  {
    files: ["**/*.{js,cjs,mjs,ts}"],
    languageOptions: {
      parser,
      parserOptions: {
        sourceType: "module",
        ecmaVersion: "latest",
        project: "./tsconfig.json",
      },
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      "@typescript-eslint": typescriptPlugin,
      import: eslintPluginImport,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "import/order": ["warn", { "newlines-between": "always" }],
    },
  },
]);
