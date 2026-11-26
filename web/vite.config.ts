import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { defineConfig } from "vite";
import type { Plugin } from "vite";
import { devtools } from "@tanstack/devtools-vite";

import { tanstackRouter } from "@tanstack/router-plugin/vite";

import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const MOCK_WORKER_PATH = "/mockServiceWorker.js";
const MOCK_WORKER_SOURCE = "msw/lib/mockServiceWorker.js";
const JAVASCRIPT = "text/javascript";

const serveMockWorker = (): Plugin => ({
    name: "serve-mock-service-worker",
    apply: "serve",
    configureServer: (server) => {
        server.middlewares.use(MOCK_WORKER_PATH, (_request, response) => {
            const source = readFileSync(createRequire(import.meta.url).resolve(MOCK_WORKER_SOURCE));
            response.setHeader("Content-Type", JAVASCRIPT);
            response.end(source);
        });
    },
});

const config = defineConfig({
    resolve: { tsconfigPaths: true },
    plugins: [
        devtools(),
        tailwindcss(),
        tanstackRouter({ target: "react", autoCodeSplitting: true }),
        viteReact(),
        serveMockWorker(),
    ],
});

export default config;
