# The frontend (`web/`)

React 19 single-page app built with Vite, TanStack Router (file routes) and TanStack Query, styled with Tailwind CSS. It manages the bot (wanted items, accounts, bids, deliveries) through the bot's HTTP API and never imports code from `src/`. It holds no business rules: the bot decides; the frontend shows state, collects input and applies UI rules. The code rules of the root `CLAUDE.md` apply here too.

## Read before you change

- **Architecture:** [`web/ARCHITECTURE.md`](ARCHITECTURE.md) before adding a feature, a route, a port, a store or an adapter. It covers the folders, MVVM per feature, where dependencies are inverted, server and client state, and tests.
- **Decisions:** the frontend's ADRs in [`web/adr/`](adr/README.md), separate from the bot's. Follow the accepted ones, and record new frontend decisions there.
- **Skill:** `web-feature` when creating a feature or adding a port, store, adapter or view-model to one.

Summary: `src/features/<feature>/` holds `model/` (plain TypeScript UI rules), `ports/`, `adapters/`, `view-model/` (hooks) and `view/` (components that only receive props), wired by `<feature>.screen.tsx` and exposed through `index.ts`. Routes are thin and compose screens; `app/` is the composition root; `shared/` holds what features share. `bun run lint` enforces these boundaries.

## File naming

kebab-case, `<name>.<role>[.<implementation>].ts(x)`, except hooks:

| Kind                | Pattern                                  | Example                                                                    |
| ------------------- | ---------------------------------------- | -------------------------------------------------------------------------- |
| Model type          | `<concept>.ts`                           | `wanted-item.ts`                                                           |
| UI rule             | `<rule>.ts`, one rule per file           | `can-save-wanted-item.ts`                                                  |
| Port                | `<name>.gateway.ts`, `<name>.store.ts`   | `wanted-items.gateway.ts`, `selected-account.store.ts`                     |
| Port implementation | `<port>.<implementation>.ts`             | `wanted-items.gateway.http-adapter.ts`, `selected-account.store.memory.ts` |
| Fake (tests only)   | `<port>.fake.ts`                         | `wanted-items.gateway.fake.ts`                                             |
| View-model          | `use<Name>ViewModel.ts` (camelCase)      | `useWantedItemsViewModel.ts`                                               |
| Any other hook      | `use<Name>.ts` (camelCase)               | `useStoreState.ts`                                                         |
| Query options       | `<name>.queries.ts`                      | `wanted-items.queries.ts` exporting `wantedItemsQuery`                     |
| View                | `<name>.view.tsx`, parts as `<name>.tsx` | `wanted-items.view.tsx`, `wanted-item-row.tsx`                             |
| Screen              | `<feature>.screen.tsx`                   | `wanted-items.screen.tsx`                                                  |
| Route               | TanStack Router file route names         | `routes/accounts.$accountId.wanted-items.tsx`                              |
| Shared UI component | `<name>.tsx` in `shared/ui/`             | `button.tsx`, `dialog.tsx`                                                 |
| Test                | `<file>.test.ts(x)` beside the file      | `wanted-items.view.test.tsx`                                               |

- **Hooks:** camelCase for both the file and the function (`useWantedItemsViewModel.ts` exports `useWantedItemsViewModel`).
- **Components:** kebab-case files, PascalCase functions (`wanted-items.view.tsx` exports `WantedItemsView`).
- **Other functions** are camelCase in kebab-case files (`wanted-items.queries.ts` exports `wantedItemsQuery`); types and interfaces are PascalCase.
- **One exported function per file.** Export a second one only when they truly can't live apart (e.g. `definePort` returning a provider and its hook as one unit). Types may sit beside the function that uses them.
- Named exports only, except the `Route` export TanStack Router requires.

## Imports

Use the `@/` alias (`@/shared/ui/button`, `@/features/wanted-items`) for anything outside the current feature; relative imports inside it. Use `import type` for interfaces and types. A feature never imports another feature; routes and `app/` use a feature only through its `index.ts`.

## Frontend code rules

- **Dependency inversion at the boundaries.** View-models reach the API, the WebSocket, storage, time and shared client state only through ports (`definePort`) and stores (`Store<T>`), never through an adapter. Only the composition root (`src/app/`) binds concrete implementations; tests bind fakes.
- **Functions, not classes.** Function components, hooks and plain functions; no OOP.
- **SOLID.** One responsibility per component, hook and function; small focused ports and props; extend by adding adapters, not by editing view-models.
- **No generator functions** (`function*`, `yield`) unless there's no reasonable alternative.
- **Libraries stay behind adapters.** Libraries for I/O and client state (HTTP clients, WebSocket clients, Zustand and the like) are imported only in `adapters/` and `shared/lib/store/`. The UI foundation we chose is used directly: React, TanStack Router and Query, Tailwind CSS, and the base components copied into `shared/ui/`.
- **Props in, JSX out** in `view/`: no fetching, no ports, no stores, no TanStack Query.
- **Styling:** Tailwind classes; reusable look and feel goes into `shared/ui/`, never copied between features.
- **No unnecessary elements.** Never wrap an element in a `div` (or any element) that adds no layout, style or meaning; use a fragment (`<>...</>`) when JSX needs a single root.
- **Semantic tags first:** `main`, `header`, `nav`, `section`, `article`, `aside`, `footer`, `ul`/`li`, `form`, `fieldset`, `label`, `button`, `table`. Use a `div` or `span` only when no semantic element fits. Users and tests then find things by role and label.

Generated files (`src/routeTree.gen.ts`, the API client in `shared/api/`) are never edited by hand: the router plugin, `bun run routes` and the client generator rebuild them.

## Bun

- Bun installs, runs scripts and tests: `bun install`, `bun run <script>`, `bun run test`. Vite serves and builds the app (`bun run dev` on port 3000, `bun run build`).
- Tests use Bun's runner with happy-dom and Testing Library preloaded (`test/setup/`). Import `describe`, `it`, `expect` and `jest` from `bun:test`.
- Read configuration (`import.meta.env`) only in `src/app/`, and pass it on through ports.
- Commands: `bun run test`, `bun run typecheck`, `bun run lint`, `bun run format`, and `bun run check` for all of them.
