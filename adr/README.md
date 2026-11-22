# Architecture Decision Records

This folder records the significant architecture decisions of the bot (`src/`), one decision per file, following Michael Nygard's ADR format.

## Conventions

- File name: `NNNN-short-title-in-kebab-case.md`, numbered in sequence (`0001`, `0002`, ...). Numbers are never reused. The frontend keeps its own records in `web/adr/`.
- An ADR is immutable once accepted. To change a decision, write a new ADR that supersedes it, and set the old one's status to `Superseded by ADR-NNNN`.
- Dates use ISO 8601 (`YYYY-MM-DD`): the day the decision was made.

## Template

```markdown
# ADR-NNNN: <Title>

- **Date:** YYYY-MM-DD
- **Status:** Proposed | Accepted | Deprecated | Superseded by ADR-NNNN
- **Deciders:** <who made the decision>

## Context

<The forces at play: the problem, constraints and facts that make a decision necessary.>

## Decision

<The decision, stated in full sentences, in active voice: "We will ...".>

## Consequences

<What becomes easier or harder, what we accept, and what would make us revisit the decision.>
```

## Index

| ADR                                             | Title                                                  | Date       | Status   |
| ----------------------------------------------- | ------------------------------------------------------ | ---------- | -------- |
| [0001](0001-keep-in-memory-repositories.md)     | Keep in-memory repositories for now                    | 2026-11-21 | Accepted |
| [0002](0002-synchronous-buses-for-the-core.md)  | Synchronous command bus and event bus for the core     | 2026-11-21 | Accepted |
| [0003](0003-api-docs-from-validator-schemas.md) | API documentation generated from the validator schemas | 2026-11-21 | Accepted |
