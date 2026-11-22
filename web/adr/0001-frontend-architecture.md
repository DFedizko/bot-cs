# ADR-0001: Frontend architecture

- **Date:** 2026-11-22
- **Status:** Accepted
- **Deciders:** DFedizko

## Context

The bot needs a user interface to manage wanted items, accounts and trades. The bot already exposes an HTTP API documented with OpenAPI (the bot's ADR-0003, `adr/0003-api-docs-from-validator-schemas.md`), and its business rules live in the backend. One developer works on both sides, mostly through AI agents that take one task per branch, so a change to the API and its screen should fit in one task, and the agents' context must stay small. The user wants the UI kept apart from state, UI rules and business rules, with dependency inversion where it makes testing easier.

## Decision

- We will build the frontend as a **separate single-page app in `web/`**, in this repository, with its own `package.json`, lockfile, lint, tests and `CLAUDE.md`. It talks to the bot only over the HTTP API and never imports code from `src/`.
- We will use **React with Vite, TanStack Router (file routes), TanStack Query and Tailwind CSS**, scaffolded with the TanStack CLI in router-only mode and run with Bun. Next.js and TanStack Start are not used: the bot is the server, so a second server layer would add nothing.
- We will organise the code by **feature with MVVM**: each feature has `model/` (plain TypeScript UI rules), `ports/`, `adapters/`, `view-model/` (hooks with TanStack Query) and `view/` (components that only receive props), wired by a screen and exposed through its `index.ts`. Features never import each other; pages compose them, layouts shared between pages (in `shared/ui/layouts/`) frame them, and route files only define routes. What more than one feature uses lives in `shared/` (`ui/`, `hooks/`, `model/` for shared business logic such as value objects, `lib/`, `adapters/`); what one feature uses stays inside it (`view/components/`, `view-model/hooks/`, `model/`), and moves to `shared/` once another feature needs it. Every hook, component, page, layout and function is named after its file. Shared components and helpers live in `shared/`, beside `features/`.
- We will **invert dependencies at the boundaries**: I/O (API, WebSocket, storage, time) and the **state manager** of shared client state, through ports bound with React context (`definePort`) in the `app/` composition root. Framework objects (the router, the `QueryClient`, devtools) and the implementations of shared contracts are created only in `shared/adapters/`, the counterpart of the bot's `external/` layer; `shared/lib/` holds contracts and helpers that touch no outside world. Shared client state sits behind a generic `Store<T>` port (`shared/lib/store/`) with swappable adapters in `shared/adapters/` (in memory today, Zustand when needed); server state stays in TanStack Query and one component's state in `useState`. React's own hooks and the chosen TanStack libraries are not wrapped. Base components copied into the repository (shadcn style) are not inverted either.
- We will **enforce these boundaries with ESLint** (`eslint-plugin-boundaries`) instead of describing them at length in docs, and run the tests with Bun's test runner, happy-dom and Testing Library, beside the files they test.
- Authentication is out of scope for now and gets its own decision before the frontend is reachable from outside the user's machine.

## Consequences

- An API change and its screen can ship in one branch and one review, and the OpenAPI document gives the frontend typed access to the API.
- Views and UI rules are tested without the network or React internals; view-models are tested against fake ports.
- The structure has more folders than a typical React app; the `web-feature` skill and the lint rules keep it consistent.
- Splitting the frontend into its own repository later means moving `web/`, since it shares no code with the bot.
- Revisit if the frontend needs server rendering (TanStack Start builds on the same router) or gets its own team or release cycle.
