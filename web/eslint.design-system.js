// @ts-check

import betterTailwindcss from "eslint-plugin-better-tailwindcss";

const TAILWIND_ENTRY_POINT = "src/styles.css";
const ARBITRARY_VALUE = "^.*[\\])](?:/[\\w.]+)?$";
const MUTED_BACKGROUND = "^(?:.*:)?bg-muted(?:/.*)?$";

const RESTRICTED_CLASSES = [
    {
        pattern: ARBITRARY_VALUE,
        message:
            'Arbitrary values bypass the design system: use a theme class or a typography utility (src/shared/ui/styles/). "$0" is not one.',
    },
    {
        pattern: MUTED_BACKGROUND,
        message: "muted is a text colour on the doop canvas: use bg-surface-2 or bg-surface-3 for a quiet surface.",
    },
];

const PROJECT_CN = {
    name: "cn",
    message:
        "Import cn from @/shared/lib/cn: it knows the typography utilities, so it never drops text-ink beside text-body.",
};

export const designSystem = {
    files: ["src/**/*.{ts,tsx}", "test/**/*.{ts,tsx}", "e2e/**/*.ts"],
    plugins: { "better-tailwindcss": betterTailwindcss },
    settings: { "better-tailwindcss": { entryPoint: TAILWIND_ENTRY_POINT } },
    rules: {
        ...betterTailwindcss.configs["recommended-error"].rules,
        "better-tailwindcss/enforce-consistent-line-wrapping": "off",
        "better-tailwindcss/no-restricted-classes": ["error", { restrict: RESTRICTED_CLASSES }],
        "no-restricted-imports": ["error", { paths: [PROJECT_CN] }],
    },
};

export const projectCn = {
    files: ["src/shared/lib/cn.ts"],
    rules: { "no-restricted-imports": "off" },
};
