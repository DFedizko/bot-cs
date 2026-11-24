# ADR-0004: HTTP client

- **Date:** 2026-11-24
- **Status:** Accepted
- **Deciders:** DFedizko

## Context

Features are about to call the bot's HTTP API (the wanted items page first). The frontend had no HTTP client. The bot already solved the same problem with an abstract `HttpClient` contract in `infrastructure/http/` and swappable adapters in `external/http/client/` (Axios, `fetch`), so changing the library touches no caller. The user wants the frontend built the same way. `web/CLAUDE.md` asked for functions, not classes, which fits components and hooks but not a contract that several adapters implement. Tests and the future mocked dev mode answer requests with MSW 2, which intercepts Bun's native `fetch` (happy-dom keeps it, see `test/__setup__/happydom.ts`).

## Decision

- We will keep the **contract apart from its adapters**, as the bot does. `shared/lib/http/` holds the abstract class `HttpClient` (`get`, `post`, `put`, `patch`, `delete`, typed result and body, options with `headers` and `query`, default headers for the client), its `definePort` pair (`HttpClientProvider`, `useHttpClient`) and `HttpError` (`status`, `code`, `message`, `fields`), the shape of the bot's error body. It imports no library.
- We will implement it with **Axios** in `shared/adapters/http-client.axios-adapter.ts` (`HttpClientAxiosAdapter`), the only place allowed to import `axios` (`bun run lint` enforces it). Axios is configured with its **`fetch` adapter**, so requests go through `fetch` like the rest of the browser and MSW answers them. The adapter maps every failure to `HttpError`: the bot's error body when there is one, `UNEXPECTED_RESPONSE` with the status for any other error response, and `NETWORK_ERROR` without status when the bot can't be reached. Callers never see an Axios type.
- The bot's base URL is **configuration**: the `AppConfig` port in `shared/lib/config/`, read from `import.meta.env.VITE_BOT_API_URL` by `readViteAppConfig` in `shared/adapters/` (the local bot, `http://localhost:3000`, when unset). The entry point builds one client from it, and `AppProviders` in `app/` binds it, together with the `QueryClient`. Tests bind the same adapter pointed at a test URL that MSW answers.
- **Classes are allowed for infrastructure**: the HTTP client, its adapters and the feature services that use it. Components, hooks and view-models stay functions.
- Features use HTTP through a **service port**. The feature declares what it needs in `ports/` (`wanted-items.service.ts` → `WantedItemsService`, an interface typed with the bot's OpenAPI types from `shared/api/bot-api.ts`, plus its `definePort` pair) and implements it in `adapters/` with a class that receives `HttpClient` through its constructor (`wanted-items.http-service.ts` → `WantedItemsHttpService`). `app/` builds the service from the bound client and binds it. The view-model receives the port and never knows it is HTTP; its tests bind the real service against MSW, or a fake.

## Consequences

- Swapping Axios for `fetch` or another library means one new adapter and one binding in `app/`; features and their tests don't change.
- Every error a caller sees is an `HttpError`, so view-models map `code` and `fields` to UI messages without knowing the library.
- MSW stays the network in tests: no test stubs `fetch` or Axios.
- The frontend now mixes classes (infrastructure) and functions (UI); the line between them is the folder, `adapters/` and `shared/lib/http/` against `view-model/` and `view/`.
- Authentication (cookies, `withCredentials`) is left out until its own decision; the bot doesn't send CORS headers yet, so the dev app reaching the bot on another port needs a proxy or CORS on the bot first.
- Revisit if the bot exposes a generated client worth using directly, or if Axios stops supporting its `fetch` adapter.
