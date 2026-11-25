# Testing guide

Tests of the bot run with `bun test` from the repository root. The runner's globals are described in [`src/CLAUDE.md`](../src/CLAUDE.md#bun-apis).

Every code rule of the root `CLAUDE.md` and `src/CLAUDE.md` applies to test code too: at most 300 lines per file, no magic values, no comments, no `for` / `while` loops.

## TDD: no production code without a failing test first

Follow Kent Beck's cycle on every change, however small:

1. **Red:** write one test for the next behaviour and run it. It must fail, and for the expected reason.
2. **Green:** write the least production code that makes it pass.
3. **Refactor:** clean up the code and the test while everything stays green.

Never write or change production code that a failing test doesn't require. A bug fix starts with a test that reproduces the bug.

## Folder structure mirrors `src/`

`test/` has exactly the same folders as `src/`, and each test file is named after the file it tests:

```
src/contexts/trading/bidding/domain/wanted-item/wanted-item.ts
test/contexts/trading/bidding/domain/wanted-item/wanted-item.spec.ts

src/contexts/trading/bidding/application/add-wanted-item/add-wanted-item.command-handler.ts
test/contexts/trading/bidding/application/add-wanted-item/add-wanted-item.command-handler.test.ts

src/contexts/trading/bidding/external/http/csgoempire/csgoempire-auction.http.adapter.ts
test/contexts/trading/bidding/external/http/csgoempire/csgoempire-auction.http.test.ts
```

Tests import production code through the `@/` alias, never with relative paths into `src/`.

## File suffixes

| Suffix     | What it covers                                                                                                             | Collaborators                            |
| ---------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `.spec.ts` | One class with no collaborators: value objects, entities, aggregates, specifications, primitives, building blocks          | None                                     |
| `.test.ts` | A class wired to its ports: command handlers, event listeners, repositories, gateways, controllers, external API contracts | In-memory adapters and fakes (see below) |

## Test doubles and fixtures

Constructors take ports, so every collaborator can be swapped. Prefer real, simple implementations over hand-written doubles.

### Wiring: the test container

`.test.ts` files never wire their object graph with `new`. Each file declares a single `let container`, assigns a fresh `testContainer()` (from `test/__builders__/test-container.builder.ts`) to it in `beforeEach`, and each test resolves only what it uses, where it uses it:

```ts
let container: Container;

beforeEach(() => {
    container = testContainer();
});

it("Should log the synchronized account", async () => {
    container.rebind(CSGOEMPIRE_AUCTION_HTTP).toConstantValue(new CsgoempireAuctionHttpFakeAdapter(1));
    const loggerSpy = jest.spyOn(container.get(LOGGER), "log");

    await container.get(SYNC_ACCOUNT_HANDLER).handle(new SynchronizeAccountCommand(1, "John Doe", 1000));

    expect(loggerSpy).toHaveBeenCalledTimes(1);
});
```

- `testContainer()` loads the real composition root (`RootContainer`) with every third-party API rebound to its fake (`fakeExternals`). It defaults to the production modules, so the real gateways run against the fakes; pass another `NODE_ENV` (`testContainer("development")`) to test that environment's wiring.
- A new container per test keeps tests independent. Inside one container every binding is a singleton, so a `jest.spyOn` on a resolved collaborator also spies on the instance the class under test received.
- Identifiers are typed, so `container.get(ID)` and `jest.spyOn(container.get(ID), "method")` need no type annotation or `Mock<...>` declaration.
- Create spies inside the test, before the act. If the class under test captures a collaborator's method when it is built (a constructor that calls `ws.on(...)`, or `bus.publish.bind(bus)`), create that spy before resolving the class.
- Override a binding with `container.rebind(ID).toConstantValue(double)` at the start of the test that needs it, **before** resolving anything that depends on it (a different fake scenario, fixed socket metadata). When every test in a file needs the same override (a ws client connected to the test server, fixed socket metadata), apply it in `beforeEach`, directly or through a small per-file helper that builds the container. Silencing a collaborator no assertion checks (`jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {})`) may also go in `beforeEach`.
- To stop a dispatched command from running its real handler, stub the bus: `jest.spyOn(commandBus, "dispatch").mockResolvedValue()`.
- A new port, adapter, handler, listener or controller is bound in its context module first, so tests can resolve it. When a test needs a new external fake, add it to `fakeExternals` (`test/__builders__/externals.builder.ts`).
- Exceptions, which keep constructing their subject directly: contract tests (the subject is a fake), tests of generic `packages/` building blocks and adapters run against `Foo` stubs, the module tests under `external/di/` that load a single module, and the HTTP / WebSocket servers a test starts to stand in for the provider.

### Which double to use

| Need                                          | Use                                                                                                   | Where                                                              |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| A repository                                  | The real in-memory adapter from `src/` (`WantedItemRepositoryInMemory`)                               | Resolved from the test container                                   |
| Event bus, command bus, logger                | The real in-memory / console adapter from `src/packages`                                              | Resolved from the test container                                   |
| A third-party API (CSGOEmpire HTTP or WS)     | A fake adapter implementing the `infrastructure/` contract, named `<file>.fake-adapter.ts`            | Next to the contract's test, under the mirrored `external/` folder |
| Recording or forcing a call                   | `jest.spyOn(container.get(ID), "method")`, its type inferred from the identifier                      | Inside the test                                                    |
| Fixed input data (commands, events, payloads) | A function returning the object, named after it (`evaluateItemCommand()`), in a `<name>.mock.ts` file | `__mocks__/` next to the test                                      |
| Domain objects with defaults                  | A builder function taking `overrides`, in a `<name>.builder.ts` file (`bidCandidate({ value })`)      | `__builders__/` next to the test                                   |

When several folders share a fake, mock or builder, put it in the nearest common parent folder, still inside the matching `__mocks__/` or `__builders__/` folder (e.g. `test/contexts/trading/shared/__mocks__/stickers.ts`). Fakes implement the real port interface, so the compiler catches any drift. Mock and builder files use kebab-case.

## Test layout

- One top-level `describe` named after the class under test (`describe("AddWantedItemCommandHandler", ...)`); nest `describe` blocks to group scenarios.
- A single `let container` at the top, assigned a fresh `testContainer()` in `beforeEach`, so every test starts from fresh state. Each test resolves its collaborators and spies itself, as `const`s. The only other top-level `let`s are fixtures the container doesn't own and `afterEach` must clean up (the HTTP / WebSocket server a test starts).
- Test names start with "Should" and describe the behaviour: `it("Should reject a bid above the item's max price", ...)`.

## FIRST

- **Fast:** tests touch no network, disk or real clock.
- **Independent:** no test depends on another test's state or on run order. Build fresh state in each test.
- **Repeatable:** same result on every machine, every run. Inject time, randomness, IDs and environment values through ports: tests never read `Bun.env` or a local `.env` (`testContainer()` binds a fixed test env; pass a source to `EnvZodAdapter` to test it).
- **Self-validating:** pass or fail through assertions only. No logs to read.
- **Timely:** written before the production code (see TDD above).

## AAA: Arrange, Act, Assert

Each test has three blocks in this order, separated by a blank line, with no comments. **Act** is a single call. Assert one behaviour per test.

## External API contracts, mocks and fakes

Never call a third-party API (e.g. CSGOEmpire) in tests.
