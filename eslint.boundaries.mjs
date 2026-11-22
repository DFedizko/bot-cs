// @ts-check

import boundaries from "eslint-plugin-boundaries";

const CONTEXT_LAYERS = ["domain", "application", "infrastructure", "external"];
const KERNELS = "{shared,shared-kernel}";
const SAME_CONTEXT = "{{ from.element.captured.context }}";

const contextLayer = (layer) => [
    { type: layer, pattern: `src/contexts/*/${layer}`, capture: ["context"], partialMatch: false },
    { type: layer, pattern: `src/contexts/*/*/${layer}`, capture: ["group", "context"], partialMatch: false },
];

const packageFolder = (folder) => ({
    type: `packages-${folder}`,
    pattern: `src/packages/${folder}`,
    partialMatch: false,
});

const ELEMENTS = [
    { type: "composition", pattern: "src/composition-root", partialMatch: false },
    { type: "composition", pattern: "src/contexts/*/external/di", partialMatch: false },
    { type: "composition", pattern: "src/contexts/*/*/external/di", partialMatch: false },
    ...CONTEXT_LAYERS.flatMap(contextLayer),
    { type: "barrel", pattern: "src/contexts/*", capture: ["context"], partialMatch: false },
    { type: "barrel", pattern: "src/contexts/*/*", capture: ["group", "context"], partialMatch: false },
    ...["building-blocks", "domain-primitives", "error", "types", "application", "infrastructure", "external"].map(
        packageFolder,
    ),
];

const ownOrKernel = (types) => [
    { to: { element: { types, captured: { context: SAME_CONTEXT } } } },
    { to: { element: { types, captured: { context: KERNELS } } } },
];

const toTypes = (types) => ({ to: { element: { types } } });

const allowFrom = (type, allowed) => allowed.map((allow) => ({ from: { element: { type } }, allow }));

const PACKAGES_CORE = ["packages-building-blocks", "packages-domain-primitives", "packages-error", "packages-types"];
const PACKAGES_INNER = [...PACKAGES_CORE, "packages-application"];
const PACKAGES_ADAPTERS = [...PACKAGES_INNER, "packages-infrastructure"];
const LIBRARY_FREE = ["domain", "application", "infrastructure", "barrel", ...PACKAGES_ADAPTERS];
const LIBRARY_FREE_EXCEPTIONS = ["packages-domain-primitives"];

const MODULE_POLICIES = [
    { allow: { to: { module: { origin: ["external", "core"] } } } },
    {
        from: { element: { types: LIBRARY_FREE.filter((type) => !LIBRARY_FREE_EXCEPTIONS.includes(type)) } },
        disallow: { to: { module: { origin: ["external", "core"] } } },
        message: "Libraries and runtime modules are used only in external/ (or packages/external, domain primitives)",
    },
];

const LOCAL_POLICIES = [
    { from: { element: { type: "composition" } }, allow: { to: { element: { types: "*" } } } },
    ...allowFrom("domain", [...ownOrKernel(["domain"]), toTypes(PACKAGES_CORE)]),
    ...allowFrom("application", [...ownOrKernel(["domain", "application"]), toTypes([...PACKAGES_INNER, "barrel"])]),
    ...allowFrom("infrastructure", [
        ...ownOrKernel(["domain", "application", "infrastructure"]),
        toTypes([...PACKAGES_ADAPTERS, "barrel"]),
    ]),
    ...allowFrom("external", [
        ...ownOrKernel(CONTEXT_LAYERS),
        toTypes([...PACKAGES_ADAPTERS, "packages-external", "barrel"]),
    ]),
    ...allowFrom("barrel", ownOrKernel(CONTEXT_LAYERS)),
    ...allowFrom("packages-building-blocks", [toTypes(PACKAGES_CORE)]),
    ...allowFrom("packages-domain-primitives", [toTypes(PACKAGES_CORE)]),
    ...allowFrom("packages-error", [toTypes(PACKAGES_CORE)]),
    ...allowFrom("packages-types", [toTypes(PACKAGES_CORE)]),
    ...allowFrom("packages-application", [toTypes(PACKAGES_INNER)]),
    ...allowFrom("packages-infrastructure", [toTypes(PACKAGES_ADAPTERS)]),
    ...allowFrom("packages-external", [toTypes([...PACKAGES_ADAPTERS, "packages-external"])]),
];

export const architectureBoundaries = {
    files: ["src/**/*.ts"],
    plugins: { boundaries },
    settings: {
        "import/resolver": { typescript: { alwaysTryTypes: true } },
        "boundaries/elements": ELEMENTS,
        "boundaries/legacy-templates": false,
    },
    rules: {
        "boundaries/dependencies": [
            2,
            {
                default: "disallow",
                checkAllOrigins: true,
                message:
                    "{{ from.element.types.[0] }} may not import this {{ to.element.types.[0] }}: layers depend inward only, and other contexts only through their barrel (index.ts). See the dependency rule in ARCHITECTURE.md",
                policies: [...MODULE_POLICIES, ...LOCAL_POLICIES],
            },
        ],
    },
};
