# Frontend architecture

The frontend is a single-page app that manages the bot (wanted items, accounts, bids, deliveries) through the bot's HTTP API. It holds no business rules: the bot decides, the frontend shows state, collects input and applies **UI rules** (validation messages, formatting, what can be clicked). The decisions behind this design are in [ADR-0004](../adr/0004-frontend-architecture.md).

## Folders

```
web/src/
  main.tsx               entry: builds the QueryClient and the router, renders <App>
  app/                   composition root: providers, router, query client, port bindings
  routes/                TanStack Router file routes: thin pages that compose features
  features/<feature>/    one folder per feature (a capability the user has: wanted-items, accounts...)
    model/               plain TypeScript: types and UI rules (no React, no libraries)
    ports/               interfaces the view-model needs, each bound through definePort()
    adapters/            implementations of the ports (API client, storage, clock)
    view-model/          use<Name>ViewModel(): TanStack Query + model + ports → state and actions
    view/                components: state and actions in through props, JSX out
    <feature>-screen.tsx the container: calls the view-model and renders the view
    index.ts             what routes and app may use: screens, providers, query options, types
  shared/
    ui/                  design system and base components (buttons, dialogs, inputs, shadcn copies)
    lib/                 generic helpers with no feature meaning (definePort, formatters)
    api/                 the client generated from the bot's OpenAPI document
web/test/setup/          test preloads (happy-dom, Testing Library)
```

A folder's name says what the user can do (`features/wanted-items/`), never which technology it uses.

## MVVM inside a feature

| Layer         | Knows                                          | Never                                           |
| ------------- | ---------------------------------------------- | ----------------------------------------------- |
| `model/`      | Its own types and rules, `shared/lib`          | React, libraries, the API                       |
| `ports/`      | `model/` types, `definePort`                   | Implementations                                 |
| `adapters/`   | `ports/`, `model/`, `shared/api`, `shared/lib` | React, TanStack                                 |
| `view-model/` | `model/`, `ports/`, TanStack Query, React      | `adapters/`, `view/`                            |
| `view/`       | Props typed by the view-model, `shared/ui`     | Ports, adapters, TanStack Query, the view-model |
| screen        | Its own feature's layers                       | Other features                                  |

- The **view** is pure presentation: everything it shows and every action it can trigger arrives through props, typed by the view-model's types (`import type`). It may keep local UI state (`useState` for an open menu) and use `shared/ui`. Render it in tests with plain objects.
- The **view-model** is a hook that turns server state (TanStack Query) and the model's rules into exactly what the view needs. It reaches the outside world only through ports.
- The **model** holds the UI rules as plain functions and types, so they're tested without React.
- The **screen** (`<feature>-screen.tsx`) wires one view-model to one view. Routes render screens.

## Dependency inversion at the I/O boundary

Invert what is slow or unpredictable: the API, the WebSocket, storage, time. Don't invert React itself (`useState`, `useEffect`) or opinionated libraries we chose (TanStack Router and Query): they are the framework, not a dependency to swap.

1. Declare the port in `ports/`: an interface plus its binding, `export const { Provider: WantedItemsGatewayProvider, usePort: useWantedItemsGateway } = definePort<WantedItemsGateway>("WantedItemsGateway")`.
2. Implement it in `adapters/` (with the client from `shared/api`).
3. Bind the implementation in `app/` by wrapping the app in the port's `Provider`. Tests bind a fake instead.
4. The view-model calls `useWantedItemsGateway()` and passes it to its queries and mutations.

An unbound port fails loudly with its name, so a missing binding is found by the first test that renders it.

## Server state with TanStack Query

- Queries and mutations live in `view-model/`. Build reusable ones as `queryOptions(...)` factories (`wantedItemsQuery(gateway, accountId)`), so a route loader can prefetch them through the feature's `index.ts`.
- Query keys start with the feature name (`["wanted-items", accountId]`), and mutations invalidate the keys they change.
- The view never sees loading or error flags from Query directly; the view-model maps them to the view's props.

## Routes

Route files are thin: read params and search params, optionally prefetch with the router's `context.queryClient`, and render a feature's screen. No UI rules and no API calls in routes. A page that shows several features composes their screens.

## Communication between features

Features never import each other. A route composes them; anything two features need moves to `shared/`. Routes and `app/` use a feature only through its `index.ts`.

## Enforcement

`bun run lint` enforces every arrow above (`eslint.boundaries.js`): layers inside a feature, no imports between features, no libraries in `model/` and `ports/`, no TanStack Query in `view/`, no React in `adapters/`. Tests (`*.test.ts(x)`) and the generated route tree are exempt.

## Tests

`bun run test` (Bun's runner, with happy-dom and Testing Library preloaded). Tests sit next to the file they test (`wanted-item-list.test.tsx` beside `wanted-item-list.tsx`), so a feature moves or dies as one folder.

| Subject     | How                                                                                           |
| ----------- | --------------------------------------------------------------------------------------------- |
| model       | Plain unit tests: input, output                                                               |
| view        | `render(<View {...props} />)` with plain objects; assert what the user sees and can do        |
| view-model  | `renderHook` inside the port's `Provider` bound to a fake, with a fresh `createQueryClient()` |
| adapters    | Against a fake HTTP server or the generated client's fake fetch; never the real bot           |
| screen/page | Render `<App>` with a memory history (see `app/app.test.tsx`)                                 |

Query the DOM the way users find things (`getByRole`, `getByLabelText`), and drive it with `@testing-library/user-event`.
