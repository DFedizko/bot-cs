// @ts-check

import boundaries from "eslint-plugin-boundaries";

const FEATURE_LAYERS = ["model", "ports", "adapters", "view-model", "view"];
const SAME_FEATURE = "{{ from.element.captured.feature }}";
const ANY_MODULE = { origin: ["external", "core"] };
const REACT_AND_TANSTACK = ["react", "react-dom", "@tanstack/*"];
const STATE_LIBRARIES = ["zustand", "jotai", "valtio", "redux", "@reduxjs/*", "mobx"];
const ALL_BUT_SHARED_ADAPTERS = [
    "app",
    "routes",
    "pages",
    "layouts",
    "feature",
    ...FEATURE_LAYERS,
    "shared-ui",
    "shared-api",
    "shared-lib",
];

const featureLayer = (layer) => ({
    type: layer,
    pattern: `src/features/*/${layer}`,
    capture: ["feature"],
    partialMatch: false,
});

const ELEMENTS = [
    { type: "app", pattern: "src/app", partialMatch: false },
    { type: "routes", pattern: "src/routes", partialMatch: false },
    { type: "pages", pattern: "src/pages", partialMatch: false },
    { type: "layouts", pattern: "src/layouts", partialMatch: false },
    ...FEATURE_LAYERS.map(featureLayer),
    { type: "feature", pattern: "src/features/*", capture: ["feature"], partialMatch: false },
    { type: "shared-ui", pattern: "src/shared/ui", partialMatch: false },
    { type: "shared-lib", pattern: "src/shared/lib", partialMatch: false },
    { type: "shared-api", pattern: "src/shared/api", partialMatch: false },
    { type: "shared-adapters", pattern: "src/shared/adapters", partialMatch: false },
];

const ownFeature = (types) => ({ to: { element: { types, captured: { feature: SAME_FEATURE } } } });

const toTypes = (types) => ({ to: { element: { types } } });

const allowFrom = (type, allowed) => allowed.map((allow) => ({ from: { element: { type } }, allow }));

const disallowModules = (types, sources, message) =>
    sources.map((source) => ({
        from: { element: { types } },
        disallow: { to: { module: { ...ANY_MODULE, source } } },
        message,
    }));

const MODULE_POLICIES = [
    { allow: { to: { module: ANY_MODULE } } },
    {
        from: { element: { types: ["model", "ports"] } },
        disallow: { to: { module: ANY_MODULE } },
        message: "model/ and ports/ are plain TypeScript: no libraries, no React. See web/ARCHITECTURE.md",
    },
    ...disallowModules(["adapters"], REACT_AND_TANSTACK, "adapters/ talk to the outside world only, without React"),
    ...disallowModules(
        ["view", "pages", "layouts"],
        ["@tanstack/react-query"],
        "view/ receives server state through its props: query in view-model/, not in the view",
    ),
    ...disallowModules(
        ALL_BUT_SHARED_ADAPTERS,
        STATE_LIBRARIES,
        "State libraries stay behind the Store port: implement it in shared/adapters/, read stores with useStoreState",
    ),
];

const LOCAL_POLICIES = [
    { from: { element: { type: "app" } }, allow: toTypes("*") },
    ...allowFrom("routes", [toTypes(["app", "pages", "layouts", "feature", "shared-lib"])]),
    ...allowFrom("pages", [toTypes(["feature", "shared-ui", "shared-lib"])]),
    ...allowFrom("layouts", [toTypes(["app", "feature", "shared-ui", "shared-lib"])]),
    ...allowFrom("feature", [ownFeature(FEATURE_LAYERS)]),
    ...allowFrom("model", [ownFeature(["model"]), toTypes(["shared-lib"])]),
    ...allowFrom("ports", [ownFeature(["model", "ports"]), toTypes(["shared-lib"])]),
    ...allowFrom("adapters", [ownFeature(["model", "ports", "adapters"]), toTypes(["shared-lib", "shared-api"])]),
    ...allowFrom("view-model", [ownFeature(["model", "ports", "view-model"]), toTypes(["shared-lib"])]),
    ...allowFrom("view", [
        ownFeature(["model", "view"]),
        { ...ownFeature(["view-model"]), dependency: { kind: "type" } },
        toTypes(["shared-ui", "shared-lib"]),
    ]),
    ...allowFrom("shared-ui", [toTypes(["shared-ui", "shared-lib"])]),
    ...allowFrom("shared-lib", [toTypes(["shared-lib"])]),
    ...allowFrom("shared-api", [toTypes(["shared-api", "shared-lib"])]),
    ...allowFrom("shared-adapters", [toTypes(["shared-adapters", "shared-lib"])]),
];

export const architectureBoundaries = {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { boundaries },
    settings: {
        "import/resolver": { typescript: { alwaysTryTypes: true } },
        "boundaries/elements": ELEMENTS,
        "boundaries/ignore": ["**/*.test.{ts,tsx}", "src/routeTree.gen.ts"],
        "boundaries/legacy-templates": false,
    },
    rules: {
        "boundaries/dependencies": [
            2,
            {
                default: "disallow",
                checkAllOrigins: true,
                message:
                    "{{ from.element.types.[0] }} may not import this {{ to.element.types.[0] }}: routes use a feature only through its index.ts, features never import each other, and inside a feature view → view-model → ports → model. See web/ARCHITECTURE.md",
                policies: [...MODULE_POLICIES, ...LOCAL_POLICIES],
            },
        ],
    },
};
