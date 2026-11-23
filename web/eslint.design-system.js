// @ts-check

import betterTailwindcss from "eslint-plugin-better-tailwindcss";

const TAILWIND_ENTRY_POINT = "src/styles.css";
const VARIANTS = "^(?:.*:)?";
const IMPORTANT = "!?$";
const ARBITRARY_VALUE = `^.*[\\])](?:/[\\w.]+)?${IMPORTANT}`;
const FRACTIONAL_STEP = `^.*-\\d+\\.\\d+${IMPORTANT}`;
const SPACING_UTILITIES = [
    "p[xytrblse]?",
    "m[xytrblse]?",
    "gap(?:-[xy])?",
    "space-[xy]",
    "inset(?:-[xy])?",
    "top",
    "right",
    "bottom",
    "left",
    "start",
    "end",
    "scroll-[mp][xytrblse]?",
].join("|");
const DOOP_STEPS = ["0", "px", "1", "2", "3", "4", "6", "8", "auto", "full", "reverse", "\\d+/\\d+"].join("|");
const OFF_SCALE_SPACING = `${VARIANTS}-?(?:${SPACING_UTILITIES})-(?!(?:${DOOP_STEPS})${IMPORTANT})[\\w.]+${IMPORTANT}`;
const MUTED_BACKGROUND = `${VARIANTS}bg-muted(?:/.*)?${IMPORTANT}`;
const INTERACTIONS = [
    "hover",
    "focus",
    "focus-visible",
    "active",
    "data-highlighted",
    "data-popup-open",
    "data-selected",
    "aria-expanded",
    "aria-selected",
].join("|");
const ACCENT_INTERACTION = `^(?:.*:)?(?:${INTERACTIONS}):(?:.*:)?bg-accent(?:/.*)?${IMPORTANT}`;

const RESTRICTED_CLASSES = [
    {
        pattern: ARBITRARY_VALUE,
        message:
            'Arbitrary values bypass the design system: use a theme class or a typography utility (src/shared/ui/styles/). "$0" is not one.',
    },
    {
        pattern: FRACTIONAL_STEP,
        message: '"$0" is off the 4px grid: use whole steps.',
    },
    {
        pattern: OFF_SCALE_SPACING,
        message:
            '"$0" is off doop\'s spacing scale (1, 2, 3, 4, 6, 8): use one of its steps, or add the step on the canvas first.',
    },
    {
        pattern: ACCENT_INTERACTION,
        message:
            '"$0": accent is doop\'s blue for the primary action. Hover, focus and highlighted rows use bg-surface-2 or bg-surface-3.',
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
