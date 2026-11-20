# Testing guide

Tests run with `bun test`. The runner's globals are described in the root [`CLAUDE.md`](../CLAUDE.md#test-runner).

Every rule from the root `CLAUDE.md` applies to test code too: at most 300 lines per file, no magic values, no comments, no `for` / `while` loops.

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
- Override a binding with `container.rebind(ID).toConstantValue(double)` at the start of the test that needs it, **before** resolving anything that depends on it (a different fake scenario, fixed socket metadata). When every test in a file needs the same override, a small per-file helper that builds the container may apply it in `beforeEach`.
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

Never call a third-party API (e.g. CSGOEmpire) in tests. Every integration is built in three pieces, in this order, and all three come from the provider's **latest official documentation** (for CSGOEmpire, see "Marketplace API docs" in the root [`CLAUDE.md`](../CLAUDE.md#marketplace-api-docs-read-on-demand)). Never guess a field, a type or an error from memory.

### 1. Contract types (`src/.../infrastructure/http/<provider>/`)

One file per endpoint (`place-bid.ts`, `get-active-auctions.ts`), exporting a namespace named after the endpoint in PascalCase:

```ts
export namespace PlaceBid {
    export interface Request {
        deposit_id: string;
        bid_value: number;
    }
    export interface Response {
        success: true;
        auction_data: PlaceBidAuctionData;
        invoice: PlaceBidInvoice;
    }
    export type ErrorResponse = { success: false; message: string };
}
```

- `Request` (body or query), `Response` (success) and `ErrorResponse` (the documented error body) for every endpoint. Omit `Request` only when the endpoint takes nothing.
- Mirror the docs exactly: the provider's `snake_case` field names, literal types where the value is fixed (`success: true`), `| null` only where the docs say nullable, `?` only where the docs say optional, unions for enumerated values (or the existing types in `shared/infrastructure/<provider>/types`). No `any`, no `unknown` placeholders, no `Record<string, never>` for a body the docs describe.
- Nested objects are interfaces in the same file, prefixed with the endpoint name (`PlaceBidInvoice`). Export them only when a mock, fake or another contract needs them; move them to `shared/infrastructure/<provider>/types/` when two endpoints share them.
- WebSocket payloads follow the same rules in `shared/infrastructure/<provider>/ws-events/<event>.ts`.
- The interface the external client implements (`csgoempire-auction.http.ts`) uses only these types: `placeBid(request: PlaceBid.Request): Promise<PlaceBid.Response>`.

### 2. Mocks (`test/.../external/http/<provider>/__mocks__/<endpoint>.mock.ts`)

Mocks are the payloads the docs show, typed by the contract:

```ts
export const placeBidRequest = { deposit_id: "28396506", bid_value: 64 } satisfies PlaceBid.Request;
export const placeBidSuccess = { success: true, auction_data, invoice } satisfies PlaceBid.Response;
export const placeBidNotEnoughCoins = { success: false, message: "..." } satisfies PlaceBid.ErrorResponse;
```

- Use `satisfies`, never `as` or a type annotation: `satisfies` keeps the literal values and rejects missing or extra fields, so a mock that drifts from the contract stops compiling.
- Copy the values from the docs' examples, so the mock looks like a real response. Name every export after the scenario: `<endpoint><Scenario>` (`placeBidSuccess`, `placeBidAuctionEnded`).
- One mock per documented error, not only the success case.
- Mocks that take parameters are functions returning the payload (`activeAuction({ id })`), built over a complete documented example.

### 3. Fakes (`test/.../external/http/<provider>/<contract>.fake-adapter.ts`)

A fake implements the same contract interface as the real adapter (`CsgoempireAuctionHttpFakeAdapter implements CsgoempireAuctionHttp`) and behaves like the provider, without the network:

- Keeps in-memory state seeded from the mocks (e.g. a `store` of active auctions), so calls affect later calls the way they would on the real API (a bid raises `auction_highest_bid`, adds to `auction_number_of_bids`).
- Fails the way the real adapter fails for each documented error: throw the same errors from `packages/infrastructure/http/errors` (`NotFoundError` for an unknown `deposit_id`) carrying the documented `ErrorResponse`.
- Scenarios are chosen through the constructor (`new CsgoempireAuctionHttpFakeAdapter(highestBidderId)`), never by editing the fake inside a test.
- Returns new objects built from the contract types, never a shared mock instance a test could mutate.
- A short comment naming the docs URL and the date you checked them is allowed at the top of the fake, as it records a decision.

### Contract tests

Each contract has a `<contract>.test.ts` next to its fake, proving the fake honours the contract for every endpoint and documented error:

- `expectTypeOf(response).toEqualTypeOf<PlaceBid.Response>()` for the shape.
- Assertions on the behaviour (state changes, the error thrown for each documented failure).

Gateways and command handlers then test against these fakes (the test container binds them in place of the real clients), so the whole chain is checked against the documented API.
