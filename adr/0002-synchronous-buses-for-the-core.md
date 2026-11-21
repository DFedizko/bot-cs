# ADR-0002: Synchronous command bus and event bus for the core

- **Date:** 2026-11-21
- **Status:** Accepted
- **Deciders:** DFedizko

## Context

`bot-cs` competes with other buyers on CSGOEmpire. New items and auction updates arrive over WebSocket, and the bot wins only if it evaluates an item and places its bid before the competition. Every millisecond between receiving an item and bidding matters.

The application follows CQRS with events: state changes are commands handled by one command handler, and event listeners react to events by dispatching further commands (e.g. `EvaluateItemCommand` → `ItemApprovedInAuctionEvent` → `OnItemApprovedInAuctionPlaceBid` → `PlaceBidCommand`). How commands and events are transported decides the latency of this chain.

An out-of-process transport (a message broker such as Redis Streams, NATS or RabbitMQ) adds serialization, network round trips and queueing to every step. An asynchronous fire-and-forget in-process bus avoids the network but lets the chain continue later and in any order, and the caller can't know when or whether a step finished.

## Decision

We will process the core trading flow (the bidding subdomain: evaluating items, placing and countering bids, leaving auctions) synchronously and in process:

- Commands go through the synchronous in-memory command bus (`CommandBusInMemory`), which runs the single handler and awaits it.
- Events of the core flow go through a synchronous in-memory event bus (`EventBusInMemorySync`), which runs each listener in order and awaits it, so the whole chain from an incoming item to the placed bid completes in one in-process call path.

We will not put a message broker or an asynchronous bus between the steps of the core flow. This is a deliberate trade-off for competitiveness and is not expected to change.

Work outside the core flow that doesn't race against other buyers (e.g. persisting data, delivery steps after a purchase, notifications) may use asynchronous processing when it brings resilience or independence, decided in its own ADR.

## Consequences

- Lowest possible latency from an incoming item to a placed bid: no serialization, no network hop and no queueing.
- Ordering is predictable and errors propagate to the caller, which makes the core flow easy to reason about and to test.
- A slow listener in the core flow slows the whole chain, so core listeners must stay fast and must not do I/O that isn't needed to decide or place the bid. Slow side effects belong outside the core flow.
- The core flow scales with a single process; scaling it means running more bot processes (e.g. one per account), not distributing one flow across machines.
- At the time of this decision the shared `EVENT_BUS` binding in `src/packages/external/di/packages.module.ts` is the asynchronous `EventBusInMemoryAsync`. Applying this decision requires binding the synchronous `EventBusInMemorySync` for the core flow (with the asynchronous bus kept, under its own identifier, only for non-core side effects).
