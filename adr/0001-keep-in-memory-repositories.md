# ADR-0001: Keep in-memory repositories for now

- **Date:** 2026-11-21
- **Status:** Accepted
- **Deciders:** DFedizko

## Context

Every repository port in the project (`WantedItemRepository`, `AccountRepository`, `AuctionParticipationRepository`, `DeliveryRepository`) is implemented in memory. The bot runs as a single process, and the domain model, use cases and integrations (CSGOEmpire, Steam) are still taking shape.

Choosing a database now would fix a storage schema before the model is stable and would add infrastructure to run, migrate and test. The repository ports already isolate the application from storage (dependency inversion), so a database can be added later without touching the domain or the use cases.

## Decision

We will keep the in-memory repository implementations for every bounded context for now, and will not introduce a database yet.

New repositories are still declared as ports in the layer that uses them and implemented in memory, so a persistent adapter can replace them later through the dependency-injection modules.

## Consequences

- Faster iteration: no schema, migrations or database to run in development and tests.
- All state is lost when the process stops: wanted items, account reservations, auction participations and deliveries. After a restart the bot must rebuild what it can from the marketplace (e.g. account sync, active withdrawals) and the user must re-create wanted items.
- Without durable storage there is no reliable outbox, so asynchronous side effects can't be retried across restarts.
- Revisit this decision when any of these becomes true: state must survive restarts (e.g. wanted items managed through the API, deliveries in progress); the bot runs as more than one process; or side effects need guaranteed delivery. The likely next step is a persistent adapter with `bun:sqlite` or Postgres (`Bun.sql`), followed by an outbox for events.
