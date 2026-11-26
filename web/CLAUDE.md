# The frontend (`web/`)

React 19 single-page app built with Vite, TanStack Router (file routes) and TanStack Query, styled with Tailwind CSS. It manages the bot (wanted items, accounts, bids, deliveries) through the bot's HTTP API and never imports code from `src/`. It holds no business rules: the bot decides; the frontend shows state, collects input and applies UI rules. The code rules of the root `CLAUDE.md` apply here too.

## Read before you change

- **Architecture:** [`web/ARCHITECTURE.md`](ARCHITECTURE.md) before adding a feature, a route, a port, a store or an adapter. It covers the folders, MVVM per feature, where dependencies are inverted, and server and client state.
- **Tests:** [`web/test/CLAUDE.md`](test/CLAUDE.md) before writing or changing any test (UI and hook integration tests, MSW mocks typed by the bot's OpenAPI document); [`web/e2e/CLAUDE.md`](e2e/CLAUDE.md) for Playwright end-to-end tests.
- **Decisions:** the frontend's ADRs in [`web/adr/`](adr/README.md), separate from the bot's. Follow the accepted ones, and record new frontend decisions there.

Summary: `src/features/<feature>/` holds `model/` (plain TypeScript UI rules), `view-model/` (hooks, with its `ports/`, `adapters/`, `queries/` and `mutations/`) and `view/` (components that only receive props), wired by `<feature>.screen.tsx` and exposed through `index.ts`. Route files only define routes, pages compose feature screens, shared layouts frame pages; `app/` is the composition root; `shared/` holds what more than one feature uses. `bun run lint` enforces these boundaries.

## Shared or inside a feature?

**What is shared lives in `shared/`; what only one feature uses lives inside that feature.** When something inside a feature becomes useful to another feature, move it to `shared/` instead of importing across features or copying it.

| What                                                                         | Used by one feature              | Shared                                                                            |
| ---------------------------------------------------------------------------- | -------------------------------- | --------------------------------------------------------------------------------- |
| Components                                                                   | `<feature>/view/components/`     | `shared/ui/components/`, both installed from a library (shadcn) and written by us |
| Layouts that frame pages                                                     | —                                | `shared/ui/layouts/`                                                              |
| Custom hooks                                                                 | `<feature>/view-model/hooks/`    | `shared/hooks/` (`useLocalStorage`, `useDebounce`)                                |
| Business logic: value objects (`Email`, `Phone`, `CoinCent`) and their rules | `<feature>/model/`               | `shared/model/`                                                                   |
| Contracts and generic helpers                                                | `<feature>/view-model/ports/`    | `shared/lib/`                                                                     |
| Implementations that touch the outside world                                 | `<feature>/view-model/adapters/` | `shared/adapters/`                                                                |

- `shared/model/` follows the same rules as a feature's `model/`: plain TypeScript, no React, no libraries. A value object is a branded type in its own file (`email/email.ts` → `Email`), plus one function per file to create and check it (`email/create-email.ts` → `createEmail`, which validates and returns an `Email`), grouped in a folder per concept.
- Shared hooks still respect the boundaries: a hook that needs the outside world (`useLocalStorage`) reaches it through a port with its adapter in `shared/adapters/`, never by calling the browser API directly.

## View-model, stores, queries and mutations

The decision is [ADR-0006](adr/0006-zustand-stores.md).

- **The view-model hook only orchestrates**, like a use case: it calls stores, queries and mutations and returns only what the view needs. UI rules live in `model/`.
- **Ports and adapters belong to the view-model:** `view-model/ports/` (service ports; store contracts in `ports/store/`), `view-model/adapters/` (HTTP services; Zustand stores in `adapters/store/`). `app/` binds the adapters.
- **Queries and mutations:** one hook per file in `view-model/queries/` (`use<What>Query`) and `view-model/mutations/` (`use<What>Mutation`), on TanStack Query, depending on the service port, never on the HTTP service. A query may select only setters from a store; a mutation selects only state, and passes it into the request.
- **Client state lives in Zustand stores behind store ports**, never in React Context (`definePort` is dependency injection, not state). Store files are `*.store.ts` and export `use<Name>Store`; the port's hook takes a selector typed against the port's state, so view-models never know Zustand. Use the [slices pattern](https://zustand.docs.pmnd.rs/guides/slices-pattern) when a store combines several concerns. Zustand is imported only in `view-model/adapters/store/` and `shared/adapters/`.
- **Read stores with atomic selectors**, one value per call: `const myState = useMyStateStore((state) => state.myState)`. Use `useShallow` only when a selector returns a new object or array. Never destructure the whole store: it re-renders on every change.

## Design system

The source of the design is the doop canvas **`CIuc1lzmCL`** ("bot-cs — Wanted items"); the decision is [ADR-0003](adr/0003-design-system-from-doop.md). Its CSS lives in `src/shared/ui/styles/` (tokens, frame values, shadcn theme mapping, typography, effects, base), imported once from `src/styles.css`.

- **Theme classes and typography utilities only:** `bg-surface`, `text-muted`, `border-line`, `rounded-md`, `p-4`, `text-page-title`, `text-body`, `text-figure`... No hex, no arbitrary values (`p-[13px]`), no inline styles for design values. Tailwind's default palette, radii, font sizes and shadows don't exist here; spacing accepts only doop's steps (1, 2, 3, 4, 6, 8) and sizes whole 4px steps. `bun run lint` rejects anything else.
- **Dark only.** There is no light theme.
- **Tokens follow doop:** `tokens.css` mirrors `doop-tokens.json` (the canvas's `get_tokens` export), and a test keeps them equal. A new value goes on the canvas first.
- **Components:** add shadcn components with `bunx --bun shadcn@latest add <name> -c web` (they land in `shared/ui/components/`), import `cn` from `@/shared/lib/cn`, and map their classes to the tokens until lint passes. Remove any `:root` or `.dark` block the CLI writes into `src/styles.css`.
- **Command palettes** use shadcn's `Command` (built on [cmdk](https://github.com/dip/cmdk)); **loading placeholders** use shadcn's `Skeleton`, animated by the `skeleton-shimmer` utility (`effects.css`, doop's shimmer in token colours, still under reduced motion). No other component library.

## File naming

**Every hook, component, page, layout, function, type and constant is named after its file**: the file name, without dots and dashes, in camelCase for hooks and functions, PascalCase for components, pages, layouts and types, and `UPPER_SNAKE_CASE` for constants. Files are kebab-case, except hooks, whose files are camelCase like the hook.

| Kind                               | File → export                                                                                                      |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Model type, UI rule, constant      | `wanted-item.ts` → `WantedItem`, `can-save-wanted-item.ts` → `canSaveWantedItem`, `app-name.ts` → `APP_NAME`       |
| Store (port and adapter)           | `selected-account.store.ts` → `useSelectedAccountStore`                                                            |
| Implementation, fake               | `create-http-wanted-items-gateway.ts` → `createHttpWantedItemsGateway`; fakes `create-fake-…` (tests only)         |
| Service port, HTTP service         | `wanted-items.service.ts` → `WantedItemsService`; `wanted-items.http-service.ts` → `WantedItemsHttpService`        |
| Hook (view-model, feature, shared) | `useWantedItemsViewModel.ts` → `useWantedItemsViewModel`                                                           |
| Query, mutation                    | `useWantedItemsQuery.ts` → `useWantedItemsQuery`; `useToggleWantedItemMutation.ts` → `useToggleWantedItemMutation` |
| View, screen, page, layout         | `wanted-items.view.tsx` → `WantedItemsView`; `.screen.tsx`, `.page.tsx`, `.layout.tsx` the same way                |
| Component, value object            | `wanted-item-row.tsx` → `WantedItemRow`; `email/email.ts` + `create-email.ts` → `Email`, `createEmail`             |
| Route, test                        | TanStack Router names (`accounts.$accountId.tsx`) → only `Route`; `test/<same path>/<file>.test.ts(x)`             |

- **Route files hold only the `Route` definition** (path, params, loader), with its `component` imported from `pages/` or `shared/ui/layouts/`: the router dictates their names, so no component can be named after them.
- **One exported function per file.** Export a second one only when they truly can't live apart (e.g. a port's `Provider` and `use<Port>` hook from `definePort`). Types may sit beside the function that uses them.
- Named exports only, except the `Route` export TanStack Router requires.

## Documentation files

**Never create, edit or delete any `.md` file** (`CLAUDE.md`, `ARCHITECTURE.md`, ADRs, skills, `README.md` or any other Markdown file) unless the user explicitly asks for that change. If you believe a doc should change, propose it in your final summary and let the user decide.

## Imports

Use the `@/` alias (`@/shared/ui/components/button`, `@/features/wanted-items`) for anything outside the current feature; relative imports inside it. Use `import type` for interfaces and types. A feature never imports another feature; routes and `app/` use a feature only through its `index.ts`.

## Frontend code rules

- **Dependency inversion at the boundaries.** View-models reach the API, the WebSocket, storage, time and shared client state only through ports (`definePort`) and stores (`Store<T>`), never through an adapter. Only the composition root (`src/app/`) binds concrete implementations; tests bind fakes.
- **Functions for UI, classes for infrastructure.** Components, hooks and view-models are functions; infrastructure may be classes.
- **SOLID.** One responsibility per component, hook and function; small focused ports and props; extend by adding adapters, not by editing view-models.
- **No generator functions** (`function*`, `yield`) unless there's no reasonable alternative.
- **Libraries stay behind adapters.** Libraries for I/O and client state (HTTP clients, WebSocket clients, Zustand and the like) are imported only in a feature's `view-model/adapters/` and in `shared/adapters/`, which also creates the framework objects (the router, the `QueryClient`, devtools), like the bot's `external/`. `shared/lib/` holds only contracts and helpers that touch no outside world. The UI foundation we chose is used directly: React, TanStack Router and Query, Tailwind CSS, and the base components copied into `shared/ui/components/`.
- **Props in, JSX out** in `view/`: no fetching, no ports, no stores, no TanStack Query.
- **Styling:** Tailwind classes; reusable look and feel goes into `shared/ui/components/`, never copied between features.
- **No unnecessary elements.** Never wrap an element in a `div` (or any element) that adds no layout, style or meaning; use a fragment (`<>...</>`) when JSX needs a single root.
- **Semantic tags first:** `main`, `header`, `nav`, `section`, `article`, `aside`, `footer`, `ul`/`li`, `form`, `fieldset`, `label`, `button`, `table`. Use a `div` or `span` only when no semantic element fits. Users and tests then find things by role and label.

Generated files (`src/routeTree.gen.ts`, the API client in `shared/api/`) are never edited by hand: the router plugin, `bun run routes` and the client generator rebuild them.

## Bun

- Bun installs, runs scripts and tests: `bun install`, `bun run <script>`, `bun run test`. Vite serves and builds the app (`bun run dev` on port 5173, beside the bot on 3000; `bun run build`).
- Tests use Bun's runner with happy-dom, Testing Library and MSW preloaded (`test/__setup__/`); import `describe`, `it`, `expect` and `jest` from `bun:test`. End-to-end tests use Playwright (`bun run test:e2e`).
- Read Vite's environment (`import.meta.env`) only in `shared/adapters/`, the way the bot reads `.env` only through its `Env` adapter, and pass values on through ports. Configuration the app needs (e.g. the bot's API URL) becomes a port in `shared/lib/` with its adapter in `shared/adapters/`.
- Commands: `bun run test`, `bun run test:e2e`, `bun run typecheck`, `bun run lint`, `bun run format`, `bun run check` (all but e2e), and `bun run api:types` to regenerate the bot's API types (bot running in development).
