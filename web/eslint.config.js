// @ts-check

import "./eslint.typescript-resolver.js";
import { tanstackConfig } from "@tanstack/eslint-config";
import pluginQuery from "@tanstack/eslint-plugin-query";
import reactHooks from "eslint-plugin-react-hooks";
import { architectureBoundaries } from "./eslint.boundaries.js";
import { designSystem, projectCn } from "./eslint.design-system.js";

export default [
    ...tanstackConfig,
    ...pluginQuery.configs["flat/recommended"],
    reactHooks.configs.flat["recommended-latest"],
    architectureBoundaries,
    designSystem,
    projectCn,
    {
        rules: {
            "import/no-cycle": "off",
            "import/order": "off",
            "sort-imports": "off",
            "@typescript-eslint/array-type": "off",
            "@typescript-eslint/require-await": "off",
            "pnpm/json-enforce-catalog": "off",
        },
    },
    {
        ignores: [
            "dist/",
            "src/routeTree.gen.ts",
            "eslint.config.js",
            "eslint.*.js",
            "openapi-typescript.resolver.js",
            "prettier.config.js",
        ],
    },
];
