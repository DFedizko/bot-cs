// @ts-check

import "./eslint.typescript-resolver.mjs";
import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import { architectureBoundaries } from "./eslint.boundaries.mjs";

const { default: tseslint } = await import("typescript-eslint");

export default defineConfig([
    {
        ignores: ["node_modules/", "dist/", "build/"],
    },

    {
        files: ["**/*.{js,mjs,ts}"],
        extends: [js.configs.recommended, tseslint.configs.recommended, eslintPluginPrettierRecommended],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.node,
            },
        },
    },

    architectureBoundaries,

    {
        files: ["src/contexts/**/infrastructure/**/*.ts"],
        rules: {
            "@typescript-eslint/no-namespace": "off",
        },
    },

    {
        files: ["**/*.d.ts"],
        rules: {
            "@typescript-eslint/no-empty-object-type": ["error", { allowInterfaces: "with-single-extends" }],
        },
    },
]);
