# The frontend (`web/`)

React 19 single-page app built with Vite, TanStack Router (file routes) and TanStack Query, styled with Tailwind CSS. It manages the bot through the bot's HTTP API and never imports code from `src/`. The rules of the root `CLAUDE.md` apply here too.

## Read before you change

- [`web/ARCHITECTURE.md`](ARCHITECTURE.md) before adding a feature, a route, a port or an adapter: folders, MVVM per feature, where to invert dependencies, server state and tests.
- The `web-feature` skill when creating a new feature.

In short: `features/<feature>/` holds `model/` (plain TypeScript UI rules), `ports/`, `adapters/`, `view-model/` (hooks with TanStack Query) and `view/` (components that only receive props), wired by `<feature>-screen.tsx` and exposed through `index.ts`. Routes are thin and compose screens; `app/` is the composition root; `shared/ui` and `shared/lib` hold what features share. `bun run lint` enforces these boundaries.

## Frontend code rules

- **Function components and hooks**, no classes. Named exports only, except the `Route` export TanStack Router requires.
- **Props in, JSX out** in `view/`: no data fetching, no ports, no TanStack Query.
- **Invert I/O only** (API, WebSocket, storage, time) through ports bound with `definePort`; don't wrap React's own hooks or TanStack's.
- **Tailwind classes** for styling; reusable look and feel goes into `shared/ui`, never copied between features.
- **Accessible markup:** real elements (`button`, `label`, `nav`), so tests can find them by role and label.
- **Imports:** `@/` for anything outside the current folder group (`@/shared/ui/button`), relative imports inside a feature. `import type` for types.
- **Files:** kebab-case named after their main export (`wanted-item-list.tsx` exports `WantedItemList`; hooks `use-wanted-items-view-model.ts`); tests beside them as `<file>.test.ts(x)`.
- **Never edit `src/routeTree.gen.ts`**: the router plugin and `bun run routes` generate it.

## Commands (run in `web/`)

`bun run dev` (port 3000), `bun run test`, `bun run typecheck`, `bun run lint`, `bun run format`, and `bun run check` for all of them.
