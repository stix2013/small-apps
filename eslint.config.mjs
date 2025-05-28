import { defineConfig, globalIgnores } from "eslint/config";
import { fixupConfigRules } from "@eslint/compat";
import noOnlyTests from "eslint-plugin-no-only-tests";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import tseslint from 'typescript-eslint';

import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: [
        js.configs.recommended,
        tseslint.configs.recommended,
    ],
    allConfig: js.configs.all
});


export default defineConfig([globalIgnores([
    "**/dist",
    "**/node_modules",
    "**/schema",
    "**/*.tmpl.*",
    "**/sw.js",
    "**/.nuxt",
    "**/staging",
    "**/*.cjs",
    "**/logs",
    "**/*.spec.ts"
]), {
    extends: fixupConfigRules(compat.extends(
        "plugin:jsdoc/recommended",
        "plugin:import/typescript",
        "plugin:@typescript-eslint/recommended",
    )),

    plugins: {
        "no-only-tests": noOnlyTests,
    },

    languageOptions: {
        globals: {
            NodeJS: true,
            $fetch: true,
        },
    },

    settings: {
        jsdoc: {
            ignoreInternal: true,

            tagNamePreference: {
                warning: "warning",
                note: "note",
            },
        },
    },

    rules: {
        "sort-imports": ["error", {
            ignoreDeclarationSort: true,
        }],

        "no-only-tests/no-only-tests": "error",
        "no-console": "off",
        "jsdoc/require-jsdoc": "off",
        "jsdoc/require-param": "off",
        "jsdoc/require-returns": "off",
        "jsdoc/require-param-type": "off",
        "no-redeclare": "off",

        "@typescript-eslint/consistent-type-imports": ["error", {
            disallowTypeAnnotations: false,
        }],

        "@typescript-eslint/ban-ts-comment": ["error", {
            "ts-expect-error": "allow-with-description",
            "ts-ignore": true,
        }],

        "@typescript-eslint/prefer-ts-expect-error": "error",

        "@typescript-eslint/no-unused-vars": ["error", {
            argsIgnorePattern: "^_",
            varsIgnorePattern: "^_",
            ignoreRestSiblings: true,
        }],
    },
}]);
