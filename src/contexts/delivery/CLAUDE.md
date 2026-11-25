# delivery

The **delivery** bounded context owns what happens **after an item was bought** on a marketplace: receiving the item through a Steam trade offer and closing the purchase on the marketplace. It doesn't decide what to buy or how much to pay; that is `trading`.

## Responsibilities

- Track one **delivery** per bought item and account, from the purchase until the item is received or the trade ends (disputed, failed, cancelled).
- Verify the Steam trade offers the account received and accept **only** the one that delivers exactly the bought item.
- Cancel received offers that ask for any of our items.
- Confirm accepted offers with the account's mobile authenticator when Steam asks for it.
- Tell the marketplace the item was received, or dispute the trade when the right offer never arrives.
- Keep one Steam session per account, logged in with that account's credentials.

Out of scope: evaluating items, bidding, balances and reservations (`trading/bidding`), and selling or depositing items.

## Ubiquitous language

| Term                      | Meaning                                                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Delivery                  | The aggregate: one bought item on its way to one account. Identified by the marketplace's trade id.                                  |
| Trade id / trade offer id | The marketplace's ids for the purchase (`id`) and for its trade offer (`tradeoffer_id`). Each endpoint documents which one it takes. |
| Expected item             | The asset (asset id, app id, market name) the seller must send.                                                                      |
| Received offer            | A Steam trade offer sent to our account, as the domain sees it.                                                                      |
| Offer verification        | The policy (specifications with a rejection reason each) that decides whether a received offer is the right one.                     |
| Delivery step             | One command of the delivery flow (accept, confirm, mark received, cancel an offer), triggered by the event of the previous step.     |

## Safety rules (non-negotiable)

These apply to every change that touches trades:

- Never accept an offer in which we give any item; cancel it. Never send offers from this context.
- Accept only an offer that carries exactly the expected item (nothing more, nothing less), from the expected seller when the marketplace provides it, with no trade hold, active and not glitched. When in doubt, accept nothing.
- Accept only when exactly one received offer passes verification.
- Respect Steam's rate limits: no busy loops, back off on HTTP 429, never retry a refused login right away, cancel offers one after another.
- Never log or persist secrets (passwords, shared and identity secrets, session cookies, API keys). Log decisions (accepted, rejected with its reason, cancelled, disputed) through the `Logger` port.
- Development mode never acts on a trade: it reads real offers but only logs accepts, cancels, confirmations, marks and disputes.

## Folders

- `domain/delivery/`: the `Delivery` aggregate, its value objects, its status lifecycle (transitions only through intention-revealing methods), its domain events (`events/`) and errors (`errors/`).
- `domain/offer-verification/`: `ReceivedOffer`, the `OfferVerificationPolicy`, its rules (`rules/`, one specification per rejection reason) and the `OfferVerdict`.
- `application/<use-case>/`: one folder per intention (start, accept, confirm, mark received, cancel, dispute), holding its command, handler, the application events it produces, the listener that triggers it and the ports only it uses.
- `application/`: ports and errors shared by several use cases live at its root (`delivery.repository.ts`, `csg-trades.gateway.ts`, `steam-credentials.ts`).
- `infrastructure/`: gateway adapters, the in-memory repository, the command bus decorator for delivery steps, and the contracts `external/` implements (`steam/`, `http/csgoempire/`).
- `external/`: Steam session adapters (the only code importing the Steam libraries), the CSGOEmpire HTTP adapter, the credentials adapter and the DI modules.

## Rules

- Delivery depends on no other bounded context: it follows withdrawals from CSGOEmpire itself. It reuses only the CSGOEmpire HTTP and WebSocket clients `trading/shared` binds, wired in `external/di/` (see the context map in `src/ARCHITECTURE.md`).
- Facts about a delivery are **domain events** recorded by the aggregate; outcomes that aren't a change of the aggregate (offer not found, scam offers found, offer cancelled, step failed) are **application events**. See "Events announce what happened" in `src/ARCHITECTURE.md`.
- Every step is idempotent: its handler checks the delivery's status first and does nothing when the step already happened, so a step can always be dispatched again.
- Delivery steps run outside the core trading flow (ADR-0002): its listeners dispatch through the delivery command bus, which reports a failed step as `DeliveryStepFailedEvent` instead of throwing. Never inject that bus anywhere else.
- Ports are split by role and owned by the use case that consumes them (interface segregation): a handler depends only on the Steam or marketplace actions it performs.
- Credentials are read per account through the `SteamCredentials` port, never from the environment directly.
- Other contexts use delivery only through its barrel (`index.ts`): commands, events and DTO types. Delivery uses other contexts only through their barrels, except in its DI modules.
- Steam behaviour comes from the libraries' documentation, and CSGOEmpire contracts from its docs.
