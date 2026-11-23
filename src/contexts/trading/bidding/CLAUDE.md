# trading/bidding

The **bidding** bounded context decides **what to buy and how much to pay**. It watches the items listed on the marketplace, checks each one against the wanted items of an account, and bids in auctions within the max price the user set. **Bidding is the core bounded context: the reason the bot exists.** In Strategic DDD terms it implements the core subdomain; everything else (delivery, account sync with the marketplace, the HTTP API, the frontend) supports it. Its edge over other buyers is speed, so changes here weigh latency first.

## Responsibilities

- Manage the **wanted items** of each account: add, edit (max price, criteria), remove, enable and disable.
- **Evaluate** every new marketplace item against the account's wanted item of the same name and decide whether to buy it, and up to which price.
- **Bid** on approved items that are in auction, and keep one **auction participation** per auction with its max bid.
- **Counter-bid** when another buyer outbids the account, and **leave the auction** when the next bid would exceed the max bid.
- Keep each account's **balance and reservations** in sync with the marketplace (active auctions and active trades), so a bid never spends more than the account can pay.
- Approved items that are **off auction** (bought at a fixed price) are announced and routed to a **withdraw** command; that command has no handler, so withdrawing isn't implemented.

Out of scope: receiving the bought item through Steam and closing the purchase on the marketplace (`delivery`), the CS2 vocabulary shared with other contexts (`shared-kernel`), the CSGOEmpire WebSocket session and shared trading concepts (`trading/shared`), and selling or depositing items.

## Ubiquitous language

| Term                                   | Meaning                                                                                                                                                                |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Account                                | The aggregate for one marketplace account: its id (the CSGOEmpire user id), name, balance and reservations.                                                            |
| Wanted item                            | The aggregate for one item an account wants to buy, identified by its market name within the account. Holds `maxFor`, criteria and whether it's enabled.               |
| `maxFor`                               | The highest price the account will pay, as a percentage over the item's recommended price (`-3` pays at most 3% below it).                                             |
| Criterion / criteria                   | Specifications a candidate item must satisfy besides price (e.g. `IsWear`). Built from `{ type, value }` primitives by `CriteriaFactory`; an unknown type is rejected. |
| Recommended price / reference price    | The marketplace's suggested price for the item (`suggested_price`), the base `maxFor` and the max price are computed from.                                             |
| Above recommended percentage           | How far the listed price is over the recommended price, as the marketplace reports it. Compared with `maxFor` to approve or reject.                                    |
| Bid candidate                          | The listed item as the wanted item sees it: its value, reference price, above recommended percentage and wear.                                                         |
| Bid decision                           | The result of evaluating a candidate: `approved`, `skipped` (the wanted item is disabled), the `maxPrice` and the `failures` (one description per unmet rule).         |
| Approved in auction / off auction      | An approved item that is sold by auction (it has an end time) or at a fixed price. Each leads to its own event and next step.                                          |
| Auction participation                  | The aggregate for one auction the bot has bid on: auction id, account and max bid. Created on the first bid, removed when the bot leaves the auction.                  |
| Max bid / max price                    | The highest value the bot may bid in an auction, computed from the reference price and `maxFor` when the item is approved.                                             |
| Bid incrementer                        | The rule for the next bid after being outbid: one cent more below 50 cents, otherwise 1% more.                                                                         |
| Outbid                                 | Another buyer, none of our accounts, became the highest bidder of an auction an account had a reservation for.                                                         |
| Balance (total / reserved / available) | Total is the account's coins, reserved is held for open bids and trades, available is what's left to bid with. A bid needs the available balance to cover it.          |
| Reservation                            | Coins held for one auction or trade, keyed by its id. Reserved when bidding, refunded when outbid or when placing the bid fails.                                       |
| Coin cent                              | Every amount in this context is an integer number of cents of the marketplace's coin (`CoinCent` in `trading/shared`).                                                 |

## The core flow

1. `NewItemWsController` receives `new_item` from the CSGOEmpire WebSocket and dispatches `EvaluateItemCommand` per item.
2. `EvaluateItemCommandHandler` finds the wanted item and evaluates it. A rejected or skipped item is only logged. An approved one publishes `ItemApprovedInAuctionEvent` (with the max price) or `ItemApprovedOffAuctionEvent`.
3. `OnItemApprovedInAuctionPlaceBid` dispatches `PlaceBidCommand` with the max bid. `PlaceBidCommandHandler` checks the available balance, reserves the bid, places it through the `AuctionGateway`, records the auction participation on the first bid and publishes `BidPlacedEvent`. If placing fails, it refunds the reservation and rethrows.
4. `AuctionUpdateWsController` receives `auction_update` and dispatches `TrackAuctionUpdateCommand`. When the new highest bidder isn't one of our accounts, the handler refunds the reservation and publishes `OutbidEvent`.
5. `OnOutbidCounterBid` computes the next bid with the bid incrementer. Within the max bid it dispatches `PlaceBidCommand` (back to step 3); above it, `LeaveAuctionCommand`, which removes the auction participation.
6. `OnItemApprovedOffAuctionWithdraw` dispatches `WithdrawItemCommand` for items approved off auction.

`SynchronizeAccountCommand` runs at startup: it rebuilds the account from the marketplace's balance and reserves what the account already has in active auctions and active trades.

## Folders

- `domain/account/`: the `Account` aggregate, its balance, reservations and errors.
- `domain/wanted-item/`: the `WantedItem` aggregate, the bid candidate, prices and percentages, `criteria/` (one specification per criterion type and the factory) and `errors/`.
- `domain/auction-participation/`: the `AuctionParticipation` aggregate and its max bid.
- `domain/` root: rules used across aggregates, such as the `BidIncrementer`.
- `application/<use-case>/`: one folder per intention (add, edit, remove and toggle a wanted item, evaluate item, place bid, track auction update, leave auction, synchronize account, withdraw item), holding its command, handler, the application events it produces, the listeners that trigger it and the ports only it uses (`auction.gateway.ts`, `active-trades.gateway.ts`).
- `application/`: repository ports shared by several use cases live at its root (`account.repository.ts`, `wanted-item.repository.ts`, `auction-participation.repository.ts`).
- `infrastructure/`: WebSocket and HTTP controllers, gateway adapters (CSGOEmpire and dry run), in-memory repositories ([ADR-0001](../../../../adr/0001-keep-in-memory-repositories.md)), the CSGOEmpire HTTP contracts `external/` implements (`http/csgoempire/`) and the route docs.
- `external/`: the CSGOEmpire HTTP adapters, the zod validation schemas of the HTTP routes and the DI modules (shared, HTTP, development and production).

## Rules

- The core flow is synchronous and in process ([ADR-0002](../../../../adr/0002-synchronous-buses-for-the-core.md)): commands and events of the chain above run one after another in one call path. Never put a broker or an asynchronous bus between its steps, and keep its handlers and listeners fast, with no I/O that isn't needed to decide or place a bid. Slow side effects belong outside the core flow.
- Never bid more than the account can pay: a bid is placed only when the available balance covers it, and only after reserving it. Every way out of a bid (outbid, a failed placement) refunds its reservation.
- Never bid above the max bid of the auction participation; leave the auction instead.
- Development never places real bids: the development module wraps the auction gateway in the dry-run adapter, which logs each bid instead of sending it. Only the production module binds the real gateway.
- Other contexts use bidding only through its barrel (`index.ts`, contracts only), and bidding uses other contexts only through theirs, except in its DI modules. See "Communication between bounded contexts" in [`src/ARCHITECTURE.md`](../../../ARCHITECTURE.md).
- CSGOEmpire contracts come from the docs (`external-api-contract` skill), and every wanted-item route is documented in the OpenAPI document (`http-route-docs` skill).
