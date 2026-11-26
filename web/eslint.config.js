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
        files: [
            "src/features/*/view/**/*.{ts,tsx}",
            "src/features/*/view-model/**/*.{ts,tsx}",
            "src/pages/**/*.{ts,tsx}",
            "src/routes/**/*.{ts,tsx}",
            "src/shared/ui/layouts/**/*.{ts,tsx}",
            "src/shared/hooks/**/*.{ts,tsx}",
        ],
        ignores: ["src/features/*/view-model/adapters/**", "src/shared/hooks/use-mobile.ts"],
        rules: {
            "no-restricted-globals": [
                "error",
                ...["window", "document", "navigator"].map((name) => ({
                    name,
                    message: "Reach the browser through a port with its adapter in shared/adapters/. See web/CLAUDE.md",
                })),
            ],
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
