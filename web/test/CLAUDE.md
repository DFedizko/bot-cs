# Frontend testing guide

Tests run with `bun run test`: Bun's runner, with happy-dom, Testing Library and MSW preloaded from `test/__setup__/`. Every code rule of the root `CLAUDE.md` and `web/CLAUDE.md` applies to test code too: at most 300 lines per file, no magic values, no comments, no `for` / `while` loops, names after files. End-to-end tests live in `web/e2e/` and have their own guide.

## TDD: no production code without a failing test first

Red → green → refactor on every change, however small. The failing test is one of the kinds below, never a component unit test: a new view starts with a failing UI integration test of its screen or page.

## What we test, and what we don't

| Kind             | Subject                                                        | How                                                                                                                                       |
| ---------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| UI integration   | A page or screen with its real view-model, adapters and stores | Testing Library + `user-event`, the bot's API answered by MSW. Assert what the user sees and can do, and the requests that should happen. |
| Hook integration | View-models and custom hooks                                   | `renderHook` with the real adapters (MSW answering) or fakes for non-HTTP ports, and memory stores. Assert the state after each action.   |
| Logic            | `model/` rules and `shared/lib/` helpers                       | Plain input → output tests                                                                                                                |
| End to end       | The happy path of each main feature, in a real browser         | Playwright, see [`web/e2e/CLAUDE.md`](../e2e/CLAUDE.md)                                                                                   |

**Never unit test components or visuals.** No test renders a component alone to check that a prop changes a color, a class or a style. A component is covered by the UI integration test of the screen or page that uses it, through what the user sees and does.

## Folder structure mirrors `src/`

`web/test/` has exactly the same folders as `web/src/`, and each test file is named after the file it tests:

```
src/features/wanted-items/wanted-items.screen.tsx
test/features/wanted-items/wanted-items.screen.test.tsx

src/features/wanted-items/view-model/useWantedItemsViewModel.ts
test/features/wanted-items/view-model/useWantedItemsViewModel.test.tsx

src/pages/account.page.tsx
test/pages/account.page.test.tsx
```

Tests import production code through the `@/` alias, never with relative paths into `src/`. `test/__setup__/` (preloads and the MSW server) is the only folder that doesn't mirror `src/`.

## Test doubles and fixtures

They live next to the test that uses them, in these folders:

| Need                                               | Use                                                                                                                         | Where                              |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| A response of the bot's API                        | An MSW handler typed by the OpenAPI document, in `<endpoint>.mock.ts` (`list-wanted-items.mock.ts` → `listWantedItemsMock`) | `__mocks__/`                       |
| A payload (request or response body)               | A function returning it, typed with `satisfies`, in `<name>.mock.ts`                                                        | `__mocks__/`                       |
| A port that isn't HTTP (clock, storage, WebSocket) | A fake implementing the port with in-memory state (`create-fake-clock.ts` → `createFakeClock`)                              | `__fakes__/`                       |
| Shared client state                                | `createMemoryStore` from `shared/adapters/`, seeded per test                                                                | Inside the test                    |
| Objects with defaults                              | A builder taking `overrides` (`wanted-item.builder.ts` → `wantedItemBuilder`)                                               | `__builders__/`                    |
| Rendering the whole app at a path                  | `renderApp(path)` (fresh QueryClient without retries, memory history)                                                       | `test/__builders__/render-app.tsx` |

When several folders share a mock, fake or builder, put it in the nearest common parent, still inside its `__mocks__/`, `__fakes__/` or `__builders__/` folder. Fakes implement the real port, so the compiler catches any drift.

## MSW and the OpenAPI document

The bot's API is never called in tests, and `fetch` or adapters are never stubbed with `jest.spyOn`: MSW is the network.

- **Types come from the bot's OpenAPI document.** `bun run api:types` (with the bot running in development) generates `src/shared/api/bot-api.ts`. Never hand-write API types; regenerate them when the bot's API changes.
- **Handlers are typed** with [`openapi-msw`](https://github.com/christoph-fricke/openapi-msw): `createOpenApiHttp<paths>({ baseUrl })`. A handler whose path, params, body or response drifts from the document stops compiling.
- **Values come from the document's examples**, the same ones Scalar shows at `/docs`, so mocks look like real answers.
- **One mock per documented response a test needs**, errors included (400 with `fields`, 404, 409, 422, 500), named after the scenario: `addWantedItemConflictMock`.
- **Register handlers inside the test** with `mswServer.use(...)` (`@/__setup__/msw-server`). Handlers reset after each test, and a request with no handler fails the test.
- To assert what was sent, capture the request in the handler and assert on it after the act.

## Writing UI integration tests

- Render through `renderApp(path)` (or a builder that wraps a screen in the same providers), with the ports bound to their real adapters.
- Find elements the way users do: `getByRole`, `getByLabelText`, `getByText`. Use `data-testid` only when no accessible query exists.
- Interact with `@testing-library/user-event` (`const user = userEvent.setup()`), and wait for async results with `findBy...` or `waitFor`.
- Assert outcomes the user notices (text, enabled or disabled controls, navigation) and the requests the action must send; never implementation details.

## Writing hook tests

`renderHook(() => useXViewModel(...), { wrapper })`, where the wrapper provides a fresh QueryClient without retries, the ports and memory stores. Trigger actions inside `act`, wait for async state with `waitFor`, and assert the returned state after each step: initial, loading, success, error.

## Layout, FIRST and AAA

- One top-level `describe` named after the subject (`describe("WantedItemsScreen", ...)`); nest `describe` blocks for scenarios. Test names start with "Should" and describe the behaviour.
- **Fast:** no real network, timers or browsers (fake ports for time). **Independent:** fresh QueryClient, store and handlers per test. **Repeatable:** no reading `import.meta.env` or real dates. **Self-validating:** assertions only. **Timely:** written before the code.
- **Arrange, Act, Assert**, in that order, separated by a blank line, no comments. Act is a single call or one user interaction. Assert one behaviour per test.
