---
name: component-creator
description: How to build React components as composable parts (a root plus subcomponents, each exported on its own, grouped in a folder with an index.ts), with UI state in one store per instance (built with the project's state manager) and app state passed in through props. Use it whenever you create a new UI component or refactor one, including wrapping a library primitive (Base UI, Radix, shadcn, Headless UI) into the project's own component, or when a component starts growing boolean or "show"/"position" props. Skip it when you only use existing components.
---

# Building components by composition

Callers assemble a component from small parts instead of configuring one big component with props, the way native HTML does with `<table>`, `<thead>` and `<tr>`. A new need becomes a new part, never a new prop on the root.

## When to compose, and when not to

- **Compose** when the component has distinct regions (header, media, title, actions, footer), optional pieces, or state its parts share (open, selected, value).
- **Don't** for a simple component with one job: a button, a badge, an icon, a label. One file, one export, a few props.
- Before writing one by hand, check whether the project's UI library already has it. When wrapping a library primitive, the library keeps owning its state and accessibility (focus trap, `aria-*` links, keyboard); your parts only add the project's styling and structure.

## Structure: one folder, one part per file, a mini barrel

```
item-card/
  item-card.tsx            ItemCard           root: owns shared state, renders the outer element
  item-card-media.tsx      ItemCardMedia
  item-card-title.tsx      ItemCardTitle
  item-card-actions.tsx    ItemCardActions
  item-card.context.ts     context + hook     internal, only when parts share state
  index.ts                 export { ItemCard } from "./item-card"; ... one line per public part
```

- Every part is a named export in its own file, named after the root: `ItemCard`, `ItemCardTitle`, `ItemCardActions`. Follow the project's file-naming rules where they exist.
- **Never the namespace style** (`ItemCard.Title`, `export const ItemCard = { Root, Title }`): callers import each part individually from the folder's `index.ts`.
- `index.ts` exports only the public parts. The context and helpers stay internal unless callers need to build their own parts.

```tsx
import { ItemCard, ItemCardMedia, ItemCardTitle, ItemCardActions } from "@/shared/ui/components/item-card";

<ItemCard>
    <ItemCardMedia src={imageUrl} alt={name} />
    <ItemCardTitle>{name}</ItemCardTitle>
    <ItemCardActions>
        <Switch checked={enabled} onCheckedChange={onToggle} />
    </ItemCardActions>
</ItemCard>;
```

## Props: children first

- **Structure goes in as children, never as props.** No `showIcon`, `iconPosition`, `title`, `footerText`, `hasDivider`, `variant="withImage"`: create a part (`ItemCardIcon`) and let the caller place it where they want it.
- **Events only where they happen and only when needed**: `onOpenChange` or `onValueChange` on the root that owns the state, `onClick` on the part that is clicked. No callback "just in case".
- **Variants** only for real visual variations of the same structure (`tone`, `size`), with a typed, finite set of values.
- Each part accepts and forwards the props of the element it renders (`className`, `aria-*`, `data-*`, `ref`), so callers can extend it without a new prop.
- Every part keeps semantic HTML (`article`, `header`, `h3`, `figure`, `button`) and adds no wrapper element that brings no layout, style or meaning.

## Shared state: UI state inside, app state through props

Separate two kinds of state:

- **UI state**: short-lived and local to one component instance (a menu is open, the highlighted item, the active tab, hover). It lives inside the component.
- **App state**: data and decisions the rest of the app cares about (server data, a selected record, filters, an item being enabled). It never lives inside a component: whoever renders the component (a page, a view-model, a container) owns it and passes it in.

Then:

1. **UI state in one store per root instance.** The root creates a store for the state its parts share, once per instance (two `ItemCard`s on a page never share state), and provides it to its parts through React context. Each part subscribes only to the slice it renders, so a change in one part doesn't re-render the others, and parts read and update it themselves: the caller never threads it through props.
    - Create the store with the **project's state manager** (`package.json`: Zustand, Jotai, Valtio, Redux...). If the project hides the library behind its own abstraction (a store interface, a store-factory port, an adapter folder), create it through that abstraction and never import the library in the component.
    - With no state manager in the project, the root keeps the state with `useState` or `useReducer` and provides it through context.
2. **App state through controlled props.** The root (or the part where the interaction happens) accepts `value`/`onValueChange`, `checked`/`onCheckedChange`, `open`/`onOpenChange`; offer `defaultValue` too when the component also makes sense uncontrolled, and keep the instance store in sync with the controlled value. Components never fetch data or read app stores.
3. **The context hook fails loudly**: `useItemCardContext()` throws `"ItemCardTitle must be used inside ItemCard"` when a part is used outside its root.
4. **Wrapped library primitives already hold their own state** (a dialog's open state, a select's value): don't copy it; only add the UI state the library doesn't have.

## Checklist

- [ ] A single-purpose component stays one file; a composed one is a folder with one part per file and an `index.ts`.
- [ ] Parts are named `<Root><Part>`, exported individually, no namespace object.
- [ ] No boolean or position props that choose structure: those are parts.
- [ ] Events only where the interaction happens, and only the ones a caller needs.
- [ ] UI state lives in one store per root instance, made with the project's state manager (or its abstraction) and provided through context; app state comes in through controlled props; no fetching or app stores inside the component.
- [ ] Library primitives keep owning their state and accessibility.
- [ ] Parts forward native props and use semantic elements.
- [ ] Code a generator owns (e.g. files a component CLI writes and may overwrite) stays as generated; compose on top of it instead of restructuring it.
