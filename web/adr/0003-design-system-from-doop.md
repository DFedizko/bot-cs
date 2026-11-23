# ADR-0003: Design system from the doop canvas, shadcn on Base UI

- **Date:** 2026-11-22
- **Status:** Accepted
- **Deciders:** DFedizko

## Context

The app was designed on doop, canvas "bot-cs — Wanted items" (`CIuc1lzmCL`): dark only, Geist and Geist Mono, graphite neutrals, one blue accent and the CS2 rarity colours. The canvas holds design tokens for colours, radius, spacing, font families and font sizes. Font weights, line heights, letter spacing, shadows and easing are not tokens yet; they live in its frames and components. The frontend needs components that already look like the canvas, and a way to keep values from drifting away from it. Tailwind's default palette and scales would let anyone write a colour or size the design never had.

## Decision

- We will build components with **shadcn on Base UI** (`base-nova` style: Lucide icons, Geist), initialised with `shadcn init -b base -p nova`. Components land in `src/shared/ui/components/`; the class helper is `cn` in `src/shared/lib/cn.ts`.
- We will take **every doop token as a Tailwind theme value with the same name** (`bg-surface`, `text-muted`, `border-line`, `rounded-md`, `p-4`, `text-sm`), and **reset Tailwind's defaults for every scale doop defines** (colours, radius, spacing, font sizes). They live in `src/shared/ui/styles/tokens.css`.
- We will keep the **4px spacing unit** as Tailwind's base (`--spacing: 4px`, in `frame-values.css`). In Tailwind 4 the spacing scale also drives widths, heights and sizes, and the frames use sizes on a 4px grid that are not spacing tokens (36px buttons, 44px inputs, 48px tiles). Doop's spacing tokens are exactly multiples of that unit, so `p-4` is still doop's 16px. Other values the frames use but doop does not name (modal and popover shadows, the snappy easing, the transition duration) sit in the same file.
- We will **map shadcn's semantic variables to doop roles** in `shadcn-theme.css` (`--background` → ground, `--primary` → accent, `--border` → line, `--destructive` → danger, charts and sidebar too), with no colour of their own. Where both use a name, **doop wins**: `accent` is doop's blue and `muted` doop's secondary text colour, so `bg-muted` is banned by lint and shadcn's `hover:bg-accent`/`bg-muted` must be remapped when a component is added.
- We will be **dark only**: the `dark:` variant always applies, `color-scheme` is dark, and there is no light palette.
- We will expose the **text styles the frames use** as utilities named after their role (`text-page-title`, `text-item-title`, `text-heading`, `text-body`, `text-helper`, `text-field-label`, `text-label`, `text-figure`, `text-key`), built on the font size and family tokens, and the effects the design repeats (`focus-ring`, `invalid-ring`, `rarity-tile-<rarity>`). Fonts come from npm (`@fontsource-variable/geist`, `@fontsource-variable/geist-mono`), never a CDN.
- We will **keep tokens in sync with doop through a committed export**: `doop-tokens.json` is the canvas's `get_tokens` output, and a test fails when `tokens.css` misses a doop token, changes its value, or defines one doop does not have. To change a token, change it on the canvas, refresh the export with the doop MCP server's `get_tokens`, and update `tokens.css` until the test passes. Doop's HTTP export needs a signed-in session, so a generator script could not run unattended.
- We will **enforce it with lint**: `eslint-plugin-better-tailwindcss` reports unknown classes, conflicting classes and class order, and bans arbitrary values (`bg-[#123456]`, `p-[13px]`, `text-(--x)`), `bg-muted` and importing `cn` from the `cn` package instead of the project's helper.

## Consequences

- A shadcn component looks like the canvas when added, except where it uses `accent` or `muted` as a surface, and its arbitrary values (`rounded-[min(…)]`, `text-[0.8rem]`) fail lint until they are mapped to tokens. Adding a component is therefore also adapting it.
- A value the design needs that no token or utility names cannot be written in a class: it must be added on the canvas first (or to `frame-values.css` when it is a derived value), which keeps the canvas the source.
- Sizes off the 4px grid (5px, 9px, 11px paddings in some components) round to the grid.
- Revisit when doop gains tokens for font weights, line heights, letter spacing, shadows or sizes: they move from `frame-values.css` and `typography.css` into `tokens.css` and the export.
