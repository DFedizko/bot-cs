# ADR-0006: Zustand stores behind store ports, queries and mutations in the view-model

- **Date:** 2026-11-26
- **Status:** Accepted
- **Deciders:** DFedizko

## Context

ADR-0005 kept a component's UI state in a store per instance, created through a `StoreFactory` port and handed to its parts through React Context, on top of the generic `Store<T>` contract and an in-memory implementation (`createMemoryStore`, `useStoreState`). That is a home-made state manager: more code than the problem needs, Context re-renders every consumer, and nothing showed how a feature would hold complex client state. Server state was spread over query-option factories and mutation hooks next to the view-model, and each feature's `ports/` and `adapters/` sat beside `view-model/`, although only the view-model uses them.

## Decision

- We will keep **client state in Zustand stores**, never in React Context. Context stays only for dependency injection (`definePort`). Shadcn's generated components keep their own context.
- We will put each store **behind a store port**. The contract (state and action types) and its `use<Name>Store` hook live in `view-model/ports/store/` (`shared/lib/store/` for a shared store); the Zustand implementation lives in `view-model/adapters/store/` (`shared/adapters/store/` when shared) and `app/` binds it through the port's `definePort` provider. Store files are `*.store.ts` and export `use<Name>Store`. Zustand is imported only there (lint allows state libraries only in `view-model/adapters/store/` and `shared/adapters/store/`), so moving to another state library changes adapters and bindings, never view-models, queries or mutations. A store that combines several concerns is built with the [slices pattern](https://zustand.docs.pmnd.rs/guides/slices-pattern).
- We will **read stores with atomic selectors**, one value per call (`const myState = useMyStateStore((state) => state.myState)`); the port's hook takes a selector typed against the port's state. `useShallow` is used only when a selector returns a new object or array. Destructuring the whole store is not allowed: it re-renders on every change.
- We will move each feature's **ports and adapters into its view-model** (`view-model/ports/`, `view-model/adapters/`), with the HTTP services and their service ports, and keep the lint boundaries on the new paths.
- We will write **one hook per query or mutation**, in `view-model/queries/` (`use<What>Query`) and `view-model/mutations/` (`use<What>Mutation`), on TanStack Query and depending on the service port only. A query may select only setters from a store, to update state from its result; a mutation selects only state, to send it.
- The **view-model hook only orchestrates**, like a use case: it calls stores, queries and mutations and returns only what the view needs; UI rules stay in `model/`.
- We will build the **⌘K palette on cmdk** through shadcn's `Command` component, and **animate loading skeletons with Tailwind only**: shadcn's `Skeleton` with a `skeleton-shimmer` utility (doop's shimmer: surface-2 to line, 1.4 s, linear; static under reduced motion). We considered MUI's `Skeleton` and dropped it: it would add a second styling engine (Emotion) next to Tailwind. The palette's open state is the first shared store (`useCommandPaletteStore`).
- This **supersedes the state part of ADR-0005**: `Store<T>`, `StoreFactory`, `createMemoryStore`, `useInstanceStore` and `useStoreState` are removed. The rarity tile's image-failed state became a shared store of failed image URLs (`useFailedImagesStore`), and the tile's tint follows whether it holds an image (CSS `:has`). The composition rules of ADR-0005 stand.

## Consequences

- One library for client state, with selectors that re-render only what changed; less code than the home-made stores.
- Zustand stores are module singletons: tests reset them after each test (`test/__setup__/zustand.ts`, Zustand's documented pattern), and state that must differ per component instance needs a key (like the image URL) or local `useState`.
- A store port injects a hook through `definePort`, so a component rendered outside `AppProviders` (or a test wrapper) fails loudly with the port's name.
- Revisit if we need per-instance stores often (Zustand's `createStore` with a provider), or adopt another state library.
