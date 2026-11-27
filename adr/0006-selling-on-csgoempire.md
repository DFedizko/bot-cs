# ADR-0006: Selling on CSGOEmpire

- **Date:** 2026-11-26
- **Status:** Accepted
- **Deciders:** DFedizko

## Context

The bot buys items on CSGOEmpire (`trading/bidding`) and receives them through Steam (`delivery`). It must now **sell** too: deposit our items on CSGOEmpire at a price, and deliver each sold item to its buyer through a Steam trade offer. Selling moves real items and money. A wrong offer gives an item away for free, and a missed deadline cancels the trade and fines the account (1%, rising to 50%, with cooldowns). Anyone who reverses a trade is banned for good.

Facts from CSGOEmpire's docs and help centre that shape the design:

- A deposit is listed by `POST /trading/deposit`, priced in coin cents. At up to +6% over the recommended price it goes through a 3-minute auction; above that it is listed on the market directly. A price can be changed, and a deposit can be cancelled only while it has no bids. An auction with at least one bid can be sold right away.
- When a buyer wins or buys the item, the seller must send the Steam trade offer and mark it as sent (`POST /trading/deposit/{deposit_id}/sent`) before the trade's `metadata.expires_at`: about 30 minutes after an auction, about 12 hours after a market listing. The seller can't cancel an active trade. If our Steam offer is cancelled, CSGOEmpire asks us to send it again until the trade expires. If the buyer doesn't accept in time, CSGOEmpire completes the trade for us.
- CSGOEmpire reports progress through the WebSocket `trade_status` event, using the trade statuses -1 to 15. The docs show no deposit `trade_status` payload and don't define the statuses.
- Coins are credited (`Credited`, 10) only after Steam's trade protection, 7 to 8 days later. A reversed trade reports `TradeReversed` (14).
- CSGOEmpire pays a seller only while it can track the seller's trades. It tracks them through a Steam access token the seller gives it (`PUT /trading/automation/access-token`). The token is valid for 24 hours, and CSGOEmpire doesn't renew it.
- The rate limit is 120 requests per 60 seconds. Going over it returns 429 and locks the client out for 60 seconds.

Today the bot holds every state in memory ([ADR-0001](0001-keep-in-memory-repositories.md)), and its event buses run in process ([ADR-0002](0002-synchronous-buses-for-the-core.md)), so a crash or restart loses any event still in flight.

## Decision

### Who owns what

We will add a **`trading/deposit`** subdomain next to `bidding`, and widen **`delivery`** so it also sends offers:

- **`trading/deposit` has no domain model** (as in [ADR-0005](0005-catalog-without-a-domain-model.md)). CSGOEmpire owns a deposit's state, so we model no aggregate and add no repository: transaction scripts in command and query handlers read and change it through gateways, and the state is always rebuilt from CSGOEmpire. Deposit owns the HTTP routes to list the CSGOEmpire inventory, deposit an item at a price, update the price, cancel (only without bids) and sell now (an auction with at least one bid). It reacts to `trade_status` for our deposits and marks offers as sent. On `Credited` it syncs the account balance, and on `TradeReversed` it logs an alert.
- **`delivery`** keeps receiving bought items and now also **sends sold items**. It sends the Steam trade offer, confirms it with the mobile authenticator, follows it until it is accepted or cancelled, and renews CSGOEmpire's trade-tracking token every day.

### Integration events in the shared kernel

Deposit and delivery talk only through four integration events, defined once in `src/contexts/shared-kernel/events/`:

| Event                | Published by | When                                                                              | Payload                                                                                                           |
| -------------------- | ------------ | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `ItemSold`           | deposit      | A buyer must receive our item (an auction winner, or a direct buyer above +6%)    | account id, deposit id, asset id, app id, market hash name, buyer Steam id, trade URL, deadline (ISO 8601 string) |
| `SaleOfferSent`      | delivery     | The Steam offer was sent and confirmed                                            | account id, deposit id, Steam trade offer id                                                                      |
| `SaleOfferAccepted`  | delivery     | The buyer accepted the offer                                                      | account id, deposit id, Steam trade offer id                                                                      |
| `SaleOfferCancelled` | delivery     | We cancelled the offer because CSGOEmpire ended the trade, or someone unknown did | account id, deposit id, Steam trade offer id, reason                                                              |

They are contracts and nothing else: they extend the `IntegrationEvent` building block, which deep-freezes a copy of the payload, and they carry only primitives, so they can cross a process boundary later. They have no behaviour. Lint gives `shared-kernel/events/` its own element: it may import only `packages/` core building blocks and the shared kernel's domain, and it may be imported by any context's application, infrastructure and external layers, never by a domain layer. This is the only exception to the shared kernel's "no events" rule.

The flow:

```
CSG trade_status (our deposit sold)
  → deposit ──publish──▶ ItemSold
      → delivery: on-item-sold-send-offer (send, confirm) ──publish──▶ SaleOfferSent
          → deposit: on-sale-offer-sent-mark-sent (POST …/sent before expires_at)
  delivery follows the offer:
      accepted                          ──publish──▶ SaleOfferAccepted
      declined by the buyer             → re-send to the same verified partner (bounded, with backoff, before the deadline)
      cancelled by someone we don't know → security alert, stop
      CSG cancelled / timed out          → cancel the Steam offer ──publish──▶ SaleOfferCancelled
CSG trade_status Credited (10)  → deposit syncs the balance;  TradeReversed (14) → alert
```

### Safety rules for sending

These rules are non-negotiable and are repeated in `src/contexts/delivery/CLAUDE.md`:

- Send only to the `trade_url` CSGOEmpire gives for that deposit. Before sending, check that the trade URL's partner and the Steam offer's partner both equal CSGOEmpire's `metadata.partner.steam_id`.
- Send one offer per sold item. It carries **exactly** that asset (asset id, app id 730, context 2) from our side and **nothing** from theirs.
- Before confirming with the mobile authenticator, re-read the offer from Steam: same offer id, same partner, exactly our one asset, nothing received, state active. Confirm only that offer id.
- Never act after CSGOEmpire's deadline, or when its trade no longer waits for us. Re-read the trade from CSGOEmpire before each send or re-send.
- Re-send only to the same verified partner, a named small number of times, with backoff, and before the deadline. Never re-send after an unexpected cancellation, which can be an API-key scam: log a security alert and stop.
- When CSGOEmpire cancels or times out the trade while our Steam offer is still open, cancel the Steam offer at once.
- Never reverse a trade. Never send or log secrets. Respect Steam's and CSGOEmpire's rate limits, and back off on 429.
- Development mode never acts: no deposit, mark as sent, send, confirm, cancel or token update. Dry-run adapters only log what they would do.
- Alerts are `Logger` messages at error level, with a stable prefix.

### Trade tracking

Delivery renews CSGOEmpire's access token every day, before it expires. It reads the token from Steam's `pointssummary/ajaxgetasyncconfig` while logged in, then calls `PUT /trading/automation/access-token` and checks `GET /trading/automation/status`. The token is a secret: it is never logged.

### Resilience: reconciliation, not a message broker

The in-memory event bus is only the fast path. A crash between two steps must never lose a step, so:

- **Every step is an idempotent command** (publish `ItemSold`, send the offer, mark as sent, re-send, cancel the offer). Each one re-reads CSGOEmpire and Steam before acting and does nothing when the step already happened. Events and the reconciler dispatch the same commands.
- **A reconciler** compares CSGOEmpire's active deposits (`GET /trading/user/trades`) with our sent Steam offers and dispatches the missing step. It runs at startup, then about every 60 seconds (well within 120 requests per minute), **only while we have at least one active deposit**. It stays idle, making no calls, while CSGOEmpire shows none. Creating a deposit or receiving any deposit `trade_status` wakes it. It stops when the last deposit ends (`Completed`, `Credited`, `Canceled` or `Timed Out`). It covers a deposit's whole life, because the riskiest gaps come before "mark as sent": a `trade_status` missed after the sale, and a crash between sending the offer and marking it.
- **No message broker.** CSGOEmpire and Steam are the source of truth, and a broker can't know what they already did: replaying a queued "send" after a crash could send twice, whereas re-reading the source can't.

### Learning the real payloads first

Because the docs show no deposit `trade_status`, development mode writes the raw `trade_status`, `deposit_failed`, `auction_update` and `deleted_item` payloads of our account to a gitignored file, `captures/csgoempire/<date>.jsonl`. `auction_update` and `deleted_item` are kept only for the items of our deposits. Contracts for those events are typed only from these captures and the docs.

## Alternatives considered

- **A domain model for deposits** (a `Deposit` aggregate with a repository). Rejected: CSGOEmpire owns the state and the rules, so a local copy would drift and would need the same reconciliation anyway.
- **Selling inside `trading/bidding`.** Rejected: bidding is the latency-critical core ([ADR-0002](0002-synchronous-buses-for-the-core.md)), and selling has a different language and a different pace.
- **A new `selling` bounded context that sends offers itself.** Rejected: delivery already owns the Steam sessions, the mobile authenticator and the trade-offer safety rules. Two contexts driving the same Steam account would duplicate the riskiest code.
- **Integration events exported from each context's barrel**, as delivery's events are today. Not chosen: deposit would import delivery's barrel and delivery would import deposit's, a dependency in both directions. In the shared kernel, both depend only on the contract.
- **A message broker** (Redis Streams, NATS, RabbitMQ) to make the steps durable. Rejected for the reason above: it adds infrastructure but can't tell what CSGOEmpire and Steam already did.
- **A durable outbox or job queue** (SQLite, or Redis with BullMQ). Postponed: it is the next step if we ever need retries and deadlines that survive a restart without waiting for a reconciliation pass.

## Consequences

- Deposit and delivery are coupled only through four stable event contracts in the shared kernel. Changing one is a change for both, so prefer adding fields over renaming them.
- Delivery grows from "receive only" to "receive and send". Its safety rules now cover the outgoing direction, which is where the money can be lost.
- With every step idempotent and a reconciler in place, a restart costs at most one reconciliation pass, and no step is lost. The reconciler adds CSGOEmpire calls only while a deposit is active.
- The 30-minute deadline after an auction leaves room for a restart plus one pass, but not for long outages. If restarts or outages ever threaten deadlines, introduce the outbox or job queue (and supersede this ADR).
- The first sale tasks must type the deposit payloads from the user's captures, not from guesses. Until then, the capture runs in development only and never acts.
- Revisit this decision if CSGOEmpire documents a deposit webhook or automatic token renewal, if we sell on a second marketplace, or if deposit gains rules of its own that CSGOEmpire doesn't enforce.
