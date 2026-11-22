# Frontend architecture

The frontend is a single-page app that manages the bot (wanted items, accounts, bids, deliveries) through the bot's HTTP API. It holds no business rules: the bot decides, the frontend shows state, collects input and applies **UI rules** (validation messages, formatting, what can be clicked). The decisions behind this design are in [ADR-0001](adr/0001-frontend-architecture.md).

## Folders

```
web/src/
  main.tsx               entry: builds the QueryClient and the router, renders <App>
  app/                   composition root: providers and port bindings, using what shared/adapters builds
  routes/                TanStack Router file routes: only the Route definition (path, params, loader)
  pages/                 one component per page (<name>.page.tsx): composes feature screens
  layouts/               shared page frames (<name>.layout.tsx): navigation, outlet, devtools
  features/<feature>/    one folder per feature (a capability the user has: wanted-items, accounts...)
    model/               plain TypeScript: types and UI rules (no React, no libraries)
    ports/               interfaces the view-model needs (gateways, stores), each bound through definePort()
    adapters/            implementations of the ports (API client, storage, clock)
    view-model/          use<Name>ViewModel(): TanStack Query + model + ports → state and actions
    view/                components: state and actions in through props, JSX out
    <feature>.screen.tsx the container: calls the view-model and renders the view
    index.ts             what routes and app may use: screens, providers, query options, types
  shared/
    ui/                  design system and base components (buttons, dialogs, inputs, shadcn copies)
    lib/                 generic helpers with no feature meaning (definePort, formatters)
      store/             the Store<T> contract, useStoreState and its adapters (memory, Zustand)
    api/                 the client generated from the bot's OpenAPI document
    adapters/            framework drivers, like the bot's external/: create the router and the QueryClient
web/test/                mirror of src/ with the tests (see web/test/CLAUDE.md)
web/e2e/                 Playwright end-to-end tests (see web/e2e/CLAUDE.md)
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
- The **screen** (`<feature>.screen.tsx`) wires one view-model to one view. Pages render screens.

## Framework drivers in `shared/adapters/`

Objects that come from the frameworks (the TanStack router, the `QueryClient`) are created only in `shared/adapters/` (`create-app-router.ts`, `create-query-client.ts`), the frontend's counterpart of the bot's `external/` layer. Only `app/` and the entry point (`main.tsx`) use them, and the test builders; features, pages and layouts never build framework objects. Changing how the router or the cache is configured touches only this folder.

## Dependency inversion at the boundaries

Invert what is slow or unpredictable (the API, the WebSocket, storage, time) and the state manager that holds shared client state. Don't invert React itself (`useState`, `useEffect`) or opinionated libraries we chose (TanStack Router and Query): they are the framework, not a dependency to swap.

1. Declare the port in `ports/`: an interface plus its binding, `export const { Provider: WantedItemsGatewayProvider, usePort: useWantedItemsGateway } = definePort<WantedItemsGateway>("WantedItemsGateway")`.
2. Implement it in `adapters/` (with the client from `shared/api`).
3. Bind the implementation in `app/` by wrapping the app in the port's `Provider`. Tests bind a fake instead.
4. The view-model calls `useWantedItemsGateway()` and passes it to its queries and mutations.

An unbound port fails loudly with its name, so a missing binding is found by the first test that renders it.

## Server state with TanStack Query

- Queries and mutations live in `view-model/`. Build reusable ones as `queryOptions(...)` factories (`wantedItemsQuery(gateway, accountId)`), so a route loader can prefetch them through the feature's `index.ts`.
- Query keys start with the feature name (`["wanted-items", accountId]`), and mutations invalidate the keys they change.
- The view never sees loading or error flags from Query directly; the view-model maps them to the view's props.

## Client state behind the Store port

Three kinds of state, three homes:

| State                                                                               | Where                               |
| ----------------------------------------------------------------------------------- | ----------------------------------- |
| Server state (what the bot knows)                                                   | TanStack Query in `view-model/`     |
| Local UI state of one component (an open menu, an input being typed)                | `useState` in that component        |
| Shared client state (selected account, filters, a draft used by several components) | a store, behind the `Store<T>` port |

The state manager is a dependency like the API, so it is inverted the same way:

- `shared/lib/store/store.ts` holds the generic contract, `Store<TState>` (`getState`, `setState(update)`, `subscribe`), and `useStoreState.ts` the hook that reads a slice of any store (`useStoreState(store, selectAccountId)`), built on React's `useSyncExternalStore`.
- The adapters are generic too and live beside the contract: `create-memory-store.ts` (`createMemoryStore`, no dependencies) and, when we adopt it, `create-zustand-store.ts` (`createZustandStore`, Zustand's vanilla store). They are the only files allowed to import a state library.
- Each feature declares its own typed store port in `ports/` (`selected-account.store.ts`: `type SelectedAccountStore = Store<SelectedAccount>` plus its `definePort` binding). The view-model reads it with `useStoreState` and changes it with `setState`; it never knows which library is underneath.
- `app/` chooses the adapter when it binds each store. Switching to Zustand means adding its adapter and changing those bindings; features don't change. Tests bind `createMemoryStore`.

## Routes, pages and layouts

- **Route files** (`routes/`) hold only the `Route` definition: path, params and search validation, and an optional loader that prefetches with the router's `context.queryClient` and a feature's query options. Their `component` comes from `pages/` or `layouts/`. TanStack Router dictates their file names, which is why components never live in them.
- **Pages** (`pages/<name>.page.tsx` → `<Name>Page`) compose feature screens and shared UI into one page. No UI rules, no API calls, no TanStack Query.
- **Layouts** (`layouts/<name>.layout.tsx` → `<Name>Layout`) frame pages: navigation, the router's `Outlet`, devtools in development.

## Communication between features

Features never import each other. A page composes them; anything two features need moves to `shared/`. Routes, pages, layouts and `app/` use a feature only through its `index.ts`.

## Enforcement

`bun run lint` enforces every arrow above (`eslint.boundaries.js`): layers inside a feature, no imports between features, no libraries in `model/` and `ports/`, no TanStack Query in `view/`, no React in `adapters/`, state libraries only in `shared/lib/store/`, and `shared/adapters/` only for `app/`. Tests (`*.test.ts(x)`) and the generated route tree are exempt.

## Tests

Tests live in `web/test/`, a mirror of `src/`, with UI integration tests (Testing Library, the bot's API answered by MSW with handlers typed by its OpenAPI document), hook integration tests and logic tests; components and visuals are never unit tested. Playwright covers the happy path of each main feature in `web/e2e/`. The rules are in [`web/test/CLAUDE.md`](test/CLAUDE.md) and [`web/e2e/CLAUDE.md`](e2e/CLAUDE.md), and the decision in [ADR-0002](adr/0002-testing-strategy.md).
