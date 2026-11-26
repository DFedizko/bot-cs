import { GlobalRegistrator } from "@happy-dom/global-registrator";

const TEST_APP_URL = "http://localhost:5173";

const { fetch, Request, Response, Headers, AbortController, AbortSignal } = globalThis;

GlobalRegistrator.register({ url: TEST_APP_URL });

Object.assign(globalThis, { fetch, Request, Response, Headers, AbortController, AbortSignal });
