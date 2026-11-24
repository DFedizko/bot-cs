# Architecture Decision Records

This folder records the significant architecture decisions of the frontend (`web/`), one decision per file, following Michael Nygard's ADR format. The bot's decisions live in the repository's `adr/` folder, with their own numbering.

## Conventions

- File name: `NNNN-short-title-in-kebab-case.md`, numbered in sequence (`0001`, `0002`, ...). Numbers are never reused.
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

| ADR                                     | Title                   | Date       | Status   |
| --------------------------------------- | ----------------------- | ---------- | -------- |
| [0001](0001-frontend-architecture.md)   | Frontend architecture   | 2026-11-22 | Accepted |
| [0002](0002-testing-strategy.md)        | Testing strategy        | 2026-11-22 | Accepted |
| [0003](0003-design-system-from-doop.md) | Design system from doop | 2026-11-22 | Accepted |
