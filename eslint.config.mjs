import tsParser from "@typescript-eslint/parser";
import parser from "@graphql-eslint/eslint-plugin";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import { includeIgnoreFile } from "@eslint/compat";
import graphqlEslint from "@graphql-eslint/eslint-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, ".gitignore");
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  includeIgnoreFile(gitignorePath),
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",

      parserOptions: {
        lib: ["esnext"],
      },
    },

    settings: {
      react: {
        version: "detect",
      },
    },
  },
  ...compat
    .extends(
      "eslint:recommended",
      "plugin:react/recommended",
      "plugin:@typescript-eslint/recommended",
    )
    .map((config) => ({
      ...config,
      files: ["**/*.ts", "**/*.tsx"],
    })),
  {
    files: ["**/*.ts", "**/*.tsx"],

    languageOptions: {
      parser: tsParser,
    },

    rules: {
      "@typescript-eslint/no-loss-of-precision": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
    },
  },
  {
    files: ["**/*.graphql"],

    plugins: {
      "@graphql-eslint": graphqlEslint,
    },

    languageOptions: {
      parser: parser,
    },

    rules: {
      "@graphql-eslint/no-anonymous-operations": "error",

      "@graphql-eslint/naming-convention": [
        "error",
        {
          OperationDefinition: {
            style: "PascalCase",
            forbiddenPrefixes: ["Query", "Mutation", "Subscription", "Get"],
            forbiddenSuffixes: ["Query", "Mutation", "Subscription"],
          },
        },
      ],
    },
  },
];
