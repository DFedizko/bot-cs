import type { Container } from "inversify";
import { biddingContainer } from "./__builders__/bidding-container.builder";
import { fakeExternals } from "@/__builders__/externals.builder";
import {
    ACCOUNT_REPOSITORY,
    ACTIVE_TRADES_GATEWAY,
    ADD_WANTED_ITEM_HANDLER,
    AUCTION_PARTICIPATION_REPO,
    AUCTION_UPDATE_CONTROLLER,
    CSGOEMPIRE_AUCTION_HTTP,
    CSGOEMPIRE_TRADE_HTTP,
    EDIT_WANTED_ITEM_HANDLER,
    EVALUATE_ITEM_HANDLER,
    LEAVE_AUCTION_HANDLER,
    NEW_ITEM_CONTROLLER,
    ON_APPROVED_IN_AUCTION,
    ON_APPROVED_OFF_AUCTION,
    ON_OUTBID,
    PLACE_BID_HANDLER,
    REMOVE_WANTED_ITEM_HANDLER,
    SYNC_ACCOUNT_HANDLER,
    TRACK_AUCTION_HANDLER,
    WANTED_ITEM_REPOSITORY,
} from "@/contexts/trading/bidding/external/di/bidding.identifiers";
import { COMMAND_BUS, COMMAND_HANDLER } from "@/packages/external/di/packages.identifiers";
import { CsgoempireAuctionHttpAdapter } from "@/contexts/trading/bidding/external/http/csgoempire/csgoempire-auction.http.adapter";
import { CsgoempireTradeHttpAdapter } from "@/contexts/trading/bidding/external/http/csgoempire/csgoempire-trade.http.adapter";
import { ActiveTradesGatewayCsgAdapter } from "@/contexts/trading/bidding/infrastructure/gateways/active-trades.gateway.csg-adapter";
import { AccountRepositoryInMemory } from "@/contexts/trading/bidding/infrastructure/repositories/account.repository.in-memory";
import { WantedItemRepositoryInMemory } from "@/contexts/trading/bidding/infrastructure/repositories/wanted-item.repository.in-memory";
import { EvaluateItemCommandHandler } from "@/contexts/trading/bidding/application/evaluate-item/evaluate-item.command-handler";
import { SynchronizeAccountCommandHandler } from "@/contexts/trading/bidding/application/synchronize-account/synchronize-account.command-handler";
import { NewItemWsController } from "@/contexts/trading/bidding/infrastructure/controllers/new-item.ws-controller";
import { AuctionParticipationRepositoryInMemory } from "@/contexts/trading/bidding/infrastructure/repositories/auction-participation.repository.in-memory";
import { AddWantedItemCommandHandler } from "@/contexts/trading/bidding/application/add-wanted-item/add-wanted-item.command-handler";
import { EditWantedItemCommandHandler } from "@/contexts/trading/bidding/application/edit-wanted-item/edit-wanted-item.command-handler";
import { RemoveWantedItemCommandHandler } from "@/contexts/trading/bidding/application/remove-wanted-item/remove-wanted-item.command-handler";
import { PlaceBidCommandHandler } from "@/contexts/trading/bidding/application/place-bid/place-bid.command-handler";
import { LeaveAuctionCommandHandler } from "@/contexts/trading/bidding/application/leave-auction/leave-auction.command-handler";
import { TrackAuctionUpdateCommandHandler } from "@/contexts/trading/bidding/application/track-auction-update/track-auction-update.command-handler";
import { OnItemApprovedInAuctionPlaceBid } from "@/contexts/trading/bidding/application/place-bid/on-item-approved-in-auction-place-bid";
import { OnItemApprovedOffAuctionWithdraw } from "@/contexts/trading/bidding/application/withdraw-item/on-item-approved-off-auction-withdraw";
import { OnOutbidCounterBid } from "@/contexts/trading/bidding/application/place-bid/on-outbid-counter-bid";
import { AuctionUpdateWsController } from "@/contexts/trading/bidding/infrastructure/controllers/auction-update.ws-controller";
import { evaluateItemCommand } from "../../application/evaluate-item/__mocks__/evaluate-item.command.mock";

const ENVIRONMENTS: ("development" | "production")[] = ["development", "production"];
const COMMAND_HANDLERS = [
    { identifier: EVALUATE_ITEM_HANDLER, implementation: EvaluateItemCommandHandler },
    { identifier: SYNC_ACCOUNT_HANDLER, implementation: SynchronizeAccountCommandHandler },
    { identifier: ADD_WANTED_ITEM_HANDLER, implementation: AddWantedItemCommandHandler },
    { identifier: EDIT_WANTED_ITEM_HANDLER, implementation: EditWantedItemCommandHandler },
    { identifier: REMOVE_WANTED_ITEM_HANDLER, implementation: RemoveWantedItemCommandHandler },
    { identifier: PLACE_BID_HANDLER, implementation: PlaceBidCommandHandler },
    { identifier: LEAVE_AUCTION_HANDLER, implementation: LeaveAuctionCommandHandler },
    { identifier: TRACK_AUCTION_HANDLER, implementation: TrackAuctionUpdateCommandHandler },
];
const EVENT_LISTENERS = [
    { identifier: ON_APPROVED_IN_AUCTION, implementation: OnItemApprovedInAuctionPlaceBid },
    { identifier: ON_APPROVED_OFF_AUCTION, implementation: OnItemApprovedOffAuctionWithdraw },
    { identifier: ON_OUTBID, implementation: OnOutbidCounterBid },
];
let container: Container;

describe.each(ENVIRONMENTS)("BiddingModule in %s", (nodeEnv) => {
    beforeEach(() => {
        container = biddingContainer(nodeEnv);
    });

    it("Should bind the csgoempire auction http adapter", () => {
        const auctionHttp = container.get(CSGOEMPIRE_AUCTION_HTTP);

        expect(auctionHttp).toBeInstanceOf(CsgoempireAuctionHttpAdapter);
    });

    it("Should bind the csgoempire trade http adapter", () => {
        const tradeHttp = container.get(CSGOEMPIRE_TRADE_HTTP);

        expect(tradeHttp).toBeInstanceOf(CsgoempireTradeHttpAdapter);
    });

    it("Should bind the csgoempire active trades gateway", () => {
        const activeTradesGateway = container.get(ACTIVE_TRADES_GATEWAY);

        expect(activeTradesGateway).toBeInstanceOf(ActiveTradesGatewayCsgAdapter);
    });

    it("Should bind the in-memory account repository", () => {
        const accountRepository = container.get(ACCOUNT_REPOSITORY);

        expect(accountRepository).toBeInstanceOf(AccountRepositoryInMemory);
    });

    it("Should bind the in-memory wanted item repository", () => {
        const wantedItemRepository = container.get(WANTED_ITEM_REPOSITORY);

        expect(wantedItemRepository).toBeInstanceOf(WantedItemRepositoryInMemory);
    });

    it("Should bind the in-memory auction participation repository", () => {
        const repository = container.get(AUCTION_PARTICIPATION_REPO);

        expect(repository).toBeInstanceOf(AuctionParticipationRepositoryInMemory);
    });

    it.each(COMMAND_HANDLERS)("Should bind the $implementation.name", async ({ identifier, implementation }) => {
        const handler = await fakeExternals(container).getAsync(identifier);

        expect(handler).toBeInstanceOf(implementation);
    });

    it("Should bind the bidding command handlers", async () => {
        const handlers = await fakeExternals(container).getAllAsync(COMMAND_HANDLER);

        expect(handlers).toEqual(COMMAND_HANDLERS.map(({ implementation }) => expect.any(implementation)));
    });

    it("Should register the handler instance bound to its own identifier", async () => {
        const handlers = await fakeExternals(container).getAllAsync(COMMAND_HANDLER);

        expect(handlers).toContain(await container.getAsync(PLACE_BID_HANDLER));
    });

    it.each(EVENT_LISTENERS)("Should bind the $implementation.name", async ({ identifier, implementation }) => {
        const listener = await fakeExternals(container).getAsync(identifier);

        expect(listener).toBeInstanceOf(implementation);
    });

    it("Should register the bidding command handlers on the command bus", async () => {
        const commandBus = await fakeExternals(container).getAsync(COMMAND_BUS);

        await expect(commandBus.dispatch(evaluateItemCommand())).resolves.toBeUndefined();
    });

    it("Should bind the new item controller to the ws client", async () => {
        const controller = await fakeExternals(container).getAsync(NEW_ITEM_CONTROLLER);

        expect(controller).toBeInstanceOf(NewItemWsController);
    });

    it("Should bind the auction update controller to the ws client", async () => {
        const controller = await fakeExternals(container).getAsync(AUCTION_UPDATE_CONTROLLER);

        expect(controller).toBeInstanceOf(AuctionUpdateWsController);
    });
});
