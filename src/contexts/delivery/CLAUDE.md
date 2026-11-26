# delivery

The **delivery** bounded context owns the Steam side of every trade: **receiving the items we bought** (accepting the seller's trade offer and closing the purchase on the marketplace) and **sending the items we sold** (sending the buyer the trade offer, confirming it and following it until the buyer accepts it or the trade ends). It doesn't decide what to buy, what to sell or at which price; that is `trading` ([ADR-0006](../../../adr/0006-selling-on-csgoempire.md) for selling).

## Responsibilities

- Track one **delivery** per bought item and account, from the purchase until the item is received or the trade ends (disputed, failed, cancelled).
- Verify the Steam trade offers the account received and accept **only** the one that delivers exactly the bought item.
- Cancel received offers that ask for any of our items.
- Confirm accepted offers with the account's mobile authenticator when Steam asks for it.
- Tell the marketplace the item was received, or dispute the trade when the right offer never arrives.
- Keep one Steam session per account, logged in with that account's credentials.
- For a sold item (`ItemSold`): send the buyer one trade offer carrying exactly that item, confirm it with the mobile authenticator, and announce it (`SaleOfferSent`).
- Follow each sale offer: accepted → `SaleOfferAccepted`; declined by the buyer → re-send safely; cancelled by someone we don't know → security alert and stop; the marketplace cancelled or timed out the trade → cancel the Steam offer and announce it (`SaleOfferCancelled`).
- Renew the marketplace's trade-tracking token every day (CSGOEmpire pays sellers only while it can track their trades).

Out of scope: evaluating items, bidding, balances and reservations (`trading/bidding`), and listing, pricing, cancelling or marking deposits as sent (`trading/deposit`).

## Ubiquitous language

| Term                      | Meaning                                                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Delivery                  | The aggregate: one bought item on its way to one account. Identified by the marketplace's trade id.                                  |
| Trade id / trade offer id | The marketplace's ids for the purchase (`id`) and for its trade offer (`tradeoffer_id`). Each endpoint documents which one it takes. |
| Expected item             | The asset (asset id, app id, market name) the seller must send.                                                                      |
| Received offer            | A Steam trade offer sent to our account, as the domain sees it.                                                                      |
| Offer verification        | The policy (specifications with a rejection reason each) that decides whether a received offer is the right one.                     |
| Delivery step             | One command of the delivery flow (accept, confirm, mark received, cancel an offer), triggered by the event of the previous step.     |
| Sale offer                | The trade offer we send a buyer for one sold item, identified by the marketplace's deposit id and Steam's trade offer id.            |
| Verified partner          | The buyer's Steam id as the marketplace gives it (`metadata.partner.steam_id`), matched by the trade URL and by the Steam offer.     |
| Trade tracking token      | The Steam access token the marketplace uses to track our trades; valid 24 hours, renewed by us.                                      |

## Safety rules (non-negotiable)

These apply to every change that touches trades:

- Never accept a **received** offer in which we give any item; cancel it. Send offers only for a sold item, following the sending rules below.
- Accept only an offer that carries exactly the expected item (nothing more, nothing less), from the expected seller when the marketplace provides it, with no trade hold, active and not glitched. When in doubt, accept nothing.
- Accept only when exactly one received offer passes verification.
- Respect Steam's rate limits: no busy loops, back off on HTTP 429, never retry a refused login right away, cancel offers one after another.
- Never log or persist secrets (passwords, shared and identity secrets, session cookies, API keys). Log decisions (accepted, rejected with its reason, cancelled, disputed) through the `Logger` port.
- Development mode never acts on a trade: it reads real offers but only logs accepts, sends, cancels, confirmations, marks, disputes and token updates.

### Sending a sold item

- Send only to the `trade_url` the marketplace gives for that deposit, and only after checking that the trade URL's partner and the Steam offer's partner both equal the marketplace's `metadata.partner.steam_id`.
- One offer per sold item, carrying **exactly** that asset (asset id, app id 730, context 2) from our side and **nothing** from theirs.
- Before confirming with the mobile authenticator, re-read the offer from Steam: same offer id, same partner, exactly our one asset, nothing received, state active. Confirm only that offer id; never confirm anything else.
- Never act after the marketplace's deadline (the trade's `metadata.expires_at`, never a hard-coded time) or when its trade no longer waits for us: re-read the trade from the marketplace before each send or re-send.
- Re-send only to the same verified partner, at most a named small number of times, with backoff, before the deadline. Never re-send after an unexpected cancellation (possible API-key scam): log a security alert and stop.
- When the marketplace cancels or times out the trade while our Steam offer is still open, cancel the Steam offer at once, or the buyer gets the item for free.
- Never reverse a trade. Never log the trade-tracking token.
- Every sending step is an idempotent command that re-reads the marketplace and Steam before acting; events and the deposit reconciler dispatch the same commands (ADR-0006).
- Alerts are `Logger` messages at error level with a stable prefix.

## Folders

- `domain/delivery/`: the `Delivery` aggregate, its value objects, its status lifecycle (transitions only through intention-revealing methods), its domain events (`events/`) and errors (`errors/`).
- `domain/offer-verification/`: `ReceivedOffer`, the `OfferVerificationPolicy`, its rules (`rules/`, one specification per rejection reason) and the `OfferVerdict`.
- `application/<use-case>/`: one folder per intention (start, accept, confirm, mark received, cancel, dispute), holding its command, handler, the application events it produces, the listener that triggers it and the ports only it uses.
- `application/`: ports and errors shared by several use cases live at its root (`delivery.repository.ts`, `csg-trades.gateway.ts`, `steam-credentials.ts`).
- `infrastructure/`: gateway adapters, the in-memory repository, the command bus decorator for delivery steps, and the contracts `external/` implements (`steam/`, `http/csgoempire/`).
- `external/`: Steam session adapters (the only code importing the Steam libraries), the CSGOEmpire HTTP adapter, the credentials adapter and the DI modules.

## Rules

- Delivery depends only on `shared-kernel` (including its integration events in `shared-kernel/events/`) and the CSGOEmpire HTTP and WebSocket clients `trading/shared` binds, wired in `external/di/` (see the context map in `src/ARCHITECTURE.md`). It follows withdrawals from CSGOEmpire itself, and learns about sales only through `ItemSold`.
- Facts about a delivery are **domain events** recorded by the aggregate; outcomes that aren't a change of the aggregate (offer not found, scam offers found, offer cancelled, step failed) are **application events**. See "Events announce what happened" in `src/ARCHITECTURE.md`.
- Every step is idempotent: its handler checks the delivery's status first and does nothing when the step already happened, so a step can always be dispatched again.
- Delivery steps run outside the core trading flow (ADR-0002): its listeners dispatch through the delivery command bus, which reports a failed step as `DeliveryStepFailedEvent` instead of throwing. Never inject that bus anywhere else.
- Ports are split by role and owned by the use case that consumes them (interface segregation): a handler depends only on the Steam or marketplace actions it performs.
- Credentials are read per account through the `SteamCredentials` port, never from the environment directly.
- Other contexts use delivery only through its barrel (`index.ts`): commands, events and DTO types. Delivery uses other contexts only through their barrels or the integration events in `shared-kernel/events/`, except in its DI modules.
- Steam behaviour comes from the libraries' documentation, and CSGOEmpire contracts from its docs.
