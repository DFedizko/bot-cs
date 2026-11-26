# ADR-0005: Composable components with UI state in a store per instance

- **Date:** 2026-11-25
- **Status:** Accepted
- **Deciders:** DFedizko

## Context

The wanted items page is the first real page: an app shell (sidebar, top bar), item cards and rows, filter chips, a sort menu, pagination. The ⌘K palette, the add and edit dialogs, and the auctions and deliveries pages will show the same skins and controls. Components that grow boolean and position props (`showIcon`, `title`, `withFooter`) get hard to reuse, and state threaded from a root through every part re-renders the whole tree. Some UI state belongs to one component instance and is shared by its parts (an image tile whose picture failed to load), while the data those components show (items, enabled, filters, the selected account) is app state owned by view-models. The state manager is already inverted behind the `Store<T>` port (ADR-0001), but nothing said how a component gets a store of its own. shadcn's CLI writes components in its own shape: several exports in one file and its own class lists.

## Decision

- We will build components **by composition**, following the `component-creator` skill: a root plus parts, each a named export in its own file, grouped in a folder with an `index.ts` that exports only the public parts (`wanted-item-card/`, `rarity-tile/`, `sort-menu/`, `pagination/`). Structure goes in as children, never as structure props; events sit only where the interaction happens; every part forwards the props of the element it renders. No namespace objects (`Card.Title`). A component with one job stays a single file.
- We will keep **UI state that a component's parts share in one store per mounted instance**, created through a new **`StoreFactory` port** in `shared/lib/store/store-factory.ts` (`<TState>(initialState: TState) => Store<TState>`, with its `definePort` pair). Its in-memory implementation, `createMemoryStoreFactory` in `shared/adapters/`, is built on `createMemoryStore` and bound once in `app/`; a Zustand factory can replace it later without touching components. The shared hook `useInstanceStore(initialState)` in `shared/hooks/` creates the store once per mounted instance, the root provides it through its context, and parts read slices with `useStoreState`. Library primitives (Base UI's menus, selects, switches) keep owning their own state and accessibility; we never copy it into a store.
- We will pass **app state through controlled props** (`value` / `onValueChange`, `checked` / `onCheckedChange`): components never fetch, never read app stores and never hold data the rest of the app cares about.
- We will make one **exception for code a library's CLI generates**: components added with `bunx --bun shadcn@latest add` stay as the CLI writes them, with several exports in one file, its comments and its structure. We only map their classes to the doop tokens (ADR-0003), set their design values (the sidebar's widths and easing) and make the smallest change lint requires. Our components compose them instead of restructuring them.

## Consequences

- A new need becomes a new part, not a new prop, so components grow without breaking callers; the price is more, smaller files.
- Two instances of a component never share UI state, and a change in one part re-renders only the parts that read that slice.
- Components depend on the `StoreFactory` binding: a component rendered outside `AppProviders` (or a test wrapper that binds it) fails loudly with the port's name.
- Generated shadcn files break our one-export-per-file and no-comments rules; re-running the CLI to update them stays possible, at the cost of mapping their classes again.
- Revisit when we adopt Zustand (bind its factory in `app/`) or if a component library we add ships its own state model that clashes with per-instance stores.
