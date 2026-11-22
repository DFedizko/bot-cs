# ADR-0002: Testing strategy

- **Date:** 2026-11-22
- **Status:** Accepted
- **Deciders:** DFedizko

## Context

The frontend follows strict TDD like the bot, but tests that check how a component looks (a prop changing a color or a class) break on every visual change and prove little about what the user can do. The bot's API is described by an OpenAPI document (the bot's ADR-0003), which can keep test data honest. The bot's tests mirror `src/` in a `test/` folder with `__mocks__`, `__fakes__` and `__builders__` beside each test, and the frontend should feel the same to whoever works on both.

## Decision

- We will keep the tests in **`web/test/`, a mirror of `web/src/`**, with mocks, fakes and builders in `__mocks__/`, `__fakes__/` and `__builders__/` next to the tests that use them, as in the bot.
- We will write **UI integration tests** with React Testing Library and `user-event`: a page or screen rendered with its real view-model, adapters and stores, asserting what the user sees and can do.
- We will answer the bot's API with **MSW**, with handlers typed by the bot's OpenAPI document (`openapi-typescript` generates the types, `openapi-msw` types the handlers), in files named `<endpoint>.mock.ts` beside the tests. Fetch and adapters are never stubbed.
- We will write **integration tests for hooks** (view-models and custom hooks) that assert their state transitions, and plain tests for UI rules and helpers.
- We will **not unit test components or visuals**.
- We will run **end-to-end tests with Playwright** for the happy path of each main feature, in `web/e2e/` (`*.e2e.ts`).
- We will use **MSW 2.x** (the latest 2.15 when decided), not 3.x: MSW 3's Node interceptor works at the socket level and doesn't intercept Bun's native `fetch` (mswjs/msw#2811). Tests keep Bun's native `fetch` under happy-dom so MSW can intercept it.

## Consequences

- Tests describe behaviour the user relies on, so refactoring components and restyling don't break them.
- A change to the bot's API that the frontend's mocks don't follow fails the typecheck after `bun run api:types`.
- Integration tests are slower than unit tests and point less precisely at a failure; hook tests narrow it down.
- Generating the API types needs the bot running in development.
- Revisit MSW 3 when it supports Bun (the proposed `msw/bun` entry point, mswjs/msw#2812).
