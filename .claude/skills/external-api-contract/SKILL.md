---
name: external-api-contract
description: How to build or change any integration with a third-party API in the bot, above all CSGOEmpire (HTTP endpoints and WebSocket events). Use it whenever a task creates or changes contract types in infrastructure/http/<provider>/ or shared/infrastructure/csgoempire/, an adapter in external/, or a mock, fake or contract test of a provider in test/ — even for a single new field. It tells where the CSGOEmpire docs are and the contract → mocks → fakes → contract tests standard.
---

# External API contracts

## CSGOEmpire docs

CSGOEmpire's API reference, as an index written for LLMs: `https://docs.csgoempire.com/reference/llms.txt`

- Fetch the index first, then only the pages of the endpoints or events you need, never the whole reference.
- The docs are the source of truth for contract types, mocks and fakes. Never guess a field, a type or an error from memory.
- Don't read them for domain, application or refactoring work that doesn't touch the API.

## The standard

Never call a third-party API (e.g. CSGOEmpire) in tests. Every integration is built in three pieces, in this order, and all three come from the provider's **latest official documentation** (for CSGOEmpire, see "CSGOEmpire docs" above). Never guess a field, a type or an error from memory.

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
