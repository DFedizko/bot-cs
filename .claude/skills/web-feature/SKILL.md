---
name: web-feature
description: Step-by-step recipe for adding a feature to the frontend (web/src/features/<feature>/) with MVVM — model, ports, stores, adapters, view-model, view, screen and index — tests first. Use it whenever a task creates a new frontend feature, page or screen, or adds a new port, store, adapter or view-model to an existing one, even when the request only says "add a page for X" or "show Y in the UI".
---

# Adding a frontend feature

Read `web/ARCHITECTURE.md` first if you haven't. Work test-first: each step starts with a failing test beside the file it covers.

## 1. Name it

The folder is what the user can do, in kebab-case: `features/wanted-items/`, `features/accounts/`. Check that no existing feature already owns it.

## 2. Model (`model/`)

Types the view works with and the UI rules as plain functions, one per file (`can-save-wanted-item.ts` exports `canSaveWantedItem`). No React, no libraries. Unit-test each rule.

## 3. Port (`ports/`)

Only when the feature needs I/O. One interface per role, shaped for this feature (not the API's shape), plus its binding:

```ts
export interface WantedItemsGateway {
    listFor: (accountId: number) => Promise<WantedItem[]>;
}

export const { Provider: WantedItemsGatewayProvider, usePort: useWantedItemsGateway } =
    definePort<WantedItemsGateway>("WantedItemsGateway");
```

## 4. Store (`ports/`), for shared client state

Only for state several components share (selected account, filters, drafts); server state stays in TanStack Query and one component's state in `useState`. Declare the typed store port and its binding:

```ts
export type SelectedAccountStore = Store<SelectedAccount>;

export const { Provider: SelectedAccountStoreProvider, usePort: useSelectedAccountStore } =
    definePort<SelectedAccountStore>("SelectedAccountStore");
```

The view-model reads it with `useStoreState(store, select...)` and changes it with `store.setState(update)`. Never import a state library: the adapter is chosen in `app/` (`createMemoryStore` from `shared/lib/store/`).

## 5. Adapter (`adapters/`)

Implements the port with the client from `shared/api`, mapping the API's types to the model's. Test it without the real bot (fake fetch or a fake server). Also write a fake (`<port>.fake.ts`) with in-memory state for the view-model tests.

## 6. View-model (`view-model/`)

`use<Name>ViewModel(...)` gets the port with `use<Port>()`, runs TanStack Query (`queryOptions` factories for reusable queries, keys starting with the feature name) and returns exactly what the view needs: data, UI states, and actions as plain callbacks. Export its return type for the view.

Test it with `renderHook` inside the ports' `Provider`s bound to the fakes and to memory stores, and a fresh `createQueryClient()` in a `QueryClientProvider`.

## 7. View (`view/`)

Components whose props are the view-model's return type (`import type`) or a part of it. Only local UI state, `shared/ui` components and Tailwind. Test with `render(<View {...props} />)` and plain objects: what is shown, and that clicks call the given callbacks.

## 8. Screen and index

- `<feature>.screen.tsx` at the feature root: `const viewModel = useXViewModel(...); return <XView {...viewModel} />;`.
- `index.ts` exports what routes and `app/` need: the screen, the port's `Provider` and interface, and query options for loaders.

## 9. Wire it

- Bind each adapter and store in `app/` by wrapping the app in the ports' `Provider`s.
- Render the screen from a thin route in `routes/` (`bun run routes` regenerates the route tree).
- Add or extend an `App`-level test with a memory history for the page.

## 10. Check

`bun run check` in `web/`. A boundary error from lint means a dependency points the wrong way: fix the dependency, never the lint config.
