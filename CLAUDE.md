# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

`bot-cs` is a trading bot for CS2 skin marketplaces. It operates on CSGOEmpire today: it listens to new items and auction updates in real time, evaluates each item against the user's **wanted items** (max price over the recommended price, criteria such as wear), bids within those limits for several accounts at once, and receives the bought items through Steam trade offers.

The repository holds two apps:

| Folder          | App                                                                                      | Its rules                                                            |
| --------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `src/`, `test/` | The bot: Bun + TypeScript backend with DDD, Clean Architecture and CQRS, and an HTTP API | [`src/CLAUDE.md`](src/CLAUDE.md), [`test/CLAUDE.md`](test/CLAUDE.md) |
| `web/`          | The frontend: React, Vite, TanStack Router and Query, Tailwind CSS                       | [`web/CLAUDE.md`](web/CLAUDE.md)                                     |

Each folder's `CLAUDE.md` loads when you work in it, so this file holds only what both apps share. The frontend talks to the bot only through its HTTP API (OpenAPI document at `GET /openapi.json`) and never imports code from `src/`.

## Rules for both apps

- **Strict TDD (Kent Beck): never write production code without a failing test written first.** Red → green → refactor. A bug fix starts with a test that reproduces it.
- **Architecture decisions** are recorded in [`adr/`](adr/README.md). Follow the accepted ones. When the user makes a new architectural decision, register it there as a new ADR, following the format and numbering in `adr/README.md`.
- **Architecture boundaries are enforced by `bun run lint`** in each app. When it reports a boundary error, fix the dependency; never loosen the lint config to silence it.
- **Bun everywhere:** `bun install`, `bun run <script>`, `bun test`, `bunx <tool>`; never npm, yarn, pnpm or node.

## Code rules (both apps)

- **No comments.** The code must explain itself through names.
- **No magic numbers or strings.** Name them as `UPPER_SNAKE_CASE` constants, or static constants on the class they belong to.
- **No `for` / `while` loops.** Use array methods (`map`, `filter`, `reduce`, `forEach`, `some`, `every`, `find`, `flatMap`, `Promise.all`).
- **Extract logic into declarative functions or methods** named with an imperative verb (`mapToDto`, `rejectInvalidBid`). The callback of a loop method that does more than one trivial expression gets its own name.
- **At most 300 lines per file**, one responsibility per file.
- **Variables, functions, methods and constants have at most 30 characters.** Class, component and file names may be longer.
- **Generated files** (route trees, type definitions, lockfiles) are exempt. Never edit them by hand; regenerate them with their tool, and gitignore them when the tool can rebuild them.

## Documentation files

**Never create, edit or delete any `.md` file** (`CLAUDE.md` at any level, `ARCHITECTURE.md`, skills, `README.md`, or any other Markdown file) unless the user explicitly asks for that change. If you believe a doc should change, propose the change in your final summary and let the user decide.

## Commands

| Task        | Bot (repository root)                    | Frontend (`cd web`) |
| ----------- | ---------------------------------------- | ------------------- |
| Install     | `bun install`                            | `bun install`       |
| Run         | `bun src/main.ts`                        | `bun run dev`       |
| Tests       | `bun test` (`bun test <filter>`)         | `bun run test`      |
| Types       | `bunx tsc --noEmit`                      | `bun run typecheck` |
| Lint        | `bun run lint` / `bun run lint:fix`      | `bun run lint`      |
| Format      | `bun run format` (Prettier on src, test) | `bun run format`    |
| Every check | the four above                           | `bun run check`     |
