import { GlobalRegistrator } from "@happy-dom/global-registrator";

const { fetch, Request, Response, Headers } = globalThis;

GlobalRegistrator.register();

Object.assign(globalThis, { fetch, Request, Response, Headers });
