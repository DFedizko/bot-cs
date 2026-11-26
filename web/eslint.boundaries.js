// @ts-check

import boundaries from "eslint-plugin-boundaries";

const FEATURE_LAYERS = ["model", "ports", "store-adapters", "adapters", "view-model", "view"];
const LAYER_FOLDERS = {
    model: "model",
    ports: "view-model/ports",
    "store-adapters": "view-model/adapters/store",
    adapters: "view-model/adapters",
    "view-model": "view-model",
    view: "view",
};
const SAME_FEATURE = "{{ from.element.captured.feature }}";
const ANY_MODULE = { origin: ["external", "core"] };
const REACT_AND_TANSTACK = ["react", "react-dom", "@tanstack/*"];
const STATE_LIBRARIES = ["zustand", "jotai", "valtio", "redux", "@reduxjs/*", "mobx"];
const HTTP_LIBRARIES = ["axios"];
const ALL_BUT_SHARED_ADAPTERS = [
    "app",
    "routes",
    "pages",
    "feature",
    ...FEATURE_LAYERS,
    "shared-ui",
    "shared-hooks",
    "shared-model",
    "shared-lib",
    "shared-api",
];
const STORE_ADAPTERS = ["store-adapters", "shared-store-adapters"];
const ALL_BUT_STORE_ADAPTERS = [
    ...ALL_BUT_SHARED_ADAPTERS.filter((type) => !STORE_ADAPTERS.includes(type)),
    "shared-adapters",
];

const featureLayer = (layer) => ({
    type: layer,
    pattern: `src/features/*/${LAYER_FOLDERS[layer]}`,
    capture: ["feature"],
    partialMatch: false,
});

const ELEMENTS = [
    { type: "app", pattern: "src/app", partialMatch: false },
    { type: "routes", pattern: "src/routes", partialMatch: false },
    { type: "pages", pattern: "src/pages", partialMatch: false },
    ...FEATURE_LAYERS.map(featureLayer),
    { type: "feature", pattern: "src/features/*", capture: ["feature"], partialMatch: false },
    { type: "shared-ui", pattern: "src/shared/ui", partialMatch: false },
    { type: "shared-hooks", pattern: "src/shared/hooks", partialMatch: false },
    { type: "shared-model", pattern: "src/shared/model", partialMatch: false },
    { type: "shared-lib", pattern: "src/shared/lib", partialMatch: false },
    { type: "shared-api", pattern: "src/shared/api", partialMatch: false },
    { type: "shared-store-adapters", pattern: "src/shared/adapters/store", partialMatch: false },
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
        from: { element: { types: ["model", "ports", "shared-model"] } },
        disallow: { to: { module: ANY_MODULE } },
        message:
            "model/, ports/ and shared/model/ are plain TypeScript: no libraries, no React. See web/ARCHITECTURE.md",
    },
    ...disallowModules(
        ["adapters", "store-adapters"],
        REACT_AND_TANSTACK,
        "adapters/ talk to the outside world only, without React",
    ),
    ...disallowModules(
        ["view", "pages", "shared-ui"],
        ["@tanstack/react-query"],
        "Views, pages and shared UI receive server state through props: query in view-model/",
    ),
    ...disallowModules(
        ALL_BUT_STORE_ADAPTERS,
        STATE_LIBRARIES,
        "State libraries stay behind store ports: implement a store in view-model/adapters/store/ or shared/adapters/store/, read it through its port's use<Name>Store hook",
    ),
    ...disallowModules(
        [...ALL_BUT_SHARED_ADAPTERS, "shared-store-adapters"],
        HTTP_LIBRARIES,
        "HTTP libraries stay behind the HttpClient contract: implement it in shared/adapters/, receive HttpClient in feature adapters. See web/adr/0004-http-client.md",
    ),
];

const SHARED_FOR_UI = ["shared-ui", "shared-hooks", "shared-model", "shared-lib"];

const LOCAL_POLICIES = [
    { from: { element: { type: "app" } }, allow: toTypes("*") },
    ...allowFrom("routes", [toTypes(["app", "pages", "feature", "shared-ui", "shared-lib"])]),
    ...allowFrom("pages", [toTypes(["feature", ...SHARED_FOR_UI])]),
    ...allowFrom("feature", [ownFeature(FEATURE_LAYERS)]),
    ...allowFrom("model", [ownFeature(["model"]), toTypes(["shared-model", "shared-lib"])]),
    ...allowFrom("ports", [ownFeature(["model", "ports"]), toTypes(["shared-model", "shared-lib"])]),
    ...allowFrom("adapters", [
        ownFeature(["model", "ports", "adapters"]),
        toTypes(["shared-model", "shared-lib", "shared-api"]),
    ]),
    ...allowFrom("store-adapters", [ownFeature(["model", "ports"]), toTypes(["shared-model", "shared-lib"])]),
    ...allowFrom("view-model", [
        ownFeature(["model", "ports", "view-model"]),
        toTypes(["shared-hooks", "shared-model", "shared-lib"]),
    ]),
    ...allowFrom("view", [
        ownFeature(["model", "view"]),
        { ...ownFeature(["view-model"]), dependency: { kind: "type" } },
        toTypes(SHARED_FOR_UI),
    ]),
    ...allowFrom("shared-ui", [toTypes(SHARED_FOR_UI)]),
    ...allowFrom("shared-hooks", [toTypes(["shared-hooks", "shared-model", "shared-lib"])]),
    ...allowFrom("shared-model", [toTypes(["shared-model"])]),
    ...allowFrom("shared-lib", [toTypes(["shared-lib", "shared-model"])]),
    ...allowFrom("shared-api", [toTypes(["shared-api", "shared-lib"])]),
    ...allowFrom("shared-adapters", [toTypes(["shared-adapters", "shared-model", "shared-lib", "shared-api"])]),
    ...allowFrom("shared-store-adapters", [toTypes(["shared-model", "shared-lib"])]),
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
