import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { COMMAND_BUS, COMMAND_HANDLER, EVENT_BUS, LOGGER } from "@/packages/external/di/packages.identifiers";
import {
    CSG_WS_CLIENT,
    CSGOEMPIRE_HTTP_CLIENT,
} from "@/contexts/trading/shared/external/di/trading-shared.identifiers";
import type { CsgWsClient } from "@/contexts/trading/shared/infrastructure/csgoempire/csg.ws-client";
import type { CommandBus } from "@/packages/application/command-bus";
import type { EventBus } from "@/packages/application/event-bus";
import type { Logger } from "@/packages/application/logger";
import type { HttpClient } from "@/packages/infrastructure/http/http-client";
import type { AccountRepository } from "../../application/account.repository";
import type { AuctionParticipationRepository } from "../../application/auction-participation.repository";
import type { WantedItemRepository } from "../../application/wanted-item.repository";
import type { AuctionGateway } from "../../application/place-bid/auction.gateway";
import type { ActiveTradesGateway } from "../../application/synchronize-account/active-trades.gateway";
import type { CsgoempireTradeHttp } from "../../infrastructure/http/csgoempire/csgoempire-trade.http";
import { AddWantedItemCommandHandler } from "../../application/add-wanted-item/add-wanted-item.command-handler";
import { EditWantedItemCommandHandler } from "../../application/edit-wanted-item/edit-wanted-item.command-handler";
import { RemoveWantedItemCommandHandler } from "../../application/remove-wanted-item/remove-wanted-item.command-handler";
import { ToggleWantedItemCommandHandler } from "../../application/toggle-wanted-item/toggle-wanted-item.command-handler";
import { EvaluateItemCommandHandler } from "../../application/evaluate-item/evaluate-item.command-handler";
import { SynchronizeAccountCommandHandler } from "../../application/synchronize-account/synchronize-account.command-handler";
import { PlaceBidCommandHandler } from "../../application/place-bid/place-bid.command-handler";
import { LeaveAuctionCommandHandler } from "../../application/leave-auction/leave-auction.command-handler";
import { TrackAuctionUpdateCommandHandler } from "../../application/track-auction-update/track-auction-update.command-handler";
import { OnItemApprovedInAuctionPlaceBid } from "../../application/place-bid/on-item-approved-in-auction-place-bid";
import { OnItemApprovedOffAuctionWithdraw } from "../../application/withdraw-item/on-item-approved-off-auction-withdraw";
import { OnOutbidCounterBid } from "../../application/place-bid/on-outbid-counter-bid";
import { ActiveTradesGatewayCsgAdapter } from "../../infrastructure/gateways/active-trades.gateway.csg-adapter";
import { AccountRepositoryInMemory } from "../../infrastructure/repositories/account.repository.in-memory";
import { AuctionParticipationRepositoryInMemory } from "../../infrastructure/repositories/auction-participation.repository.in-memory";
import { WantedItemRepositoryInMemory } from "../../infrastructure/repositories/wanted-item.repository.in-memory";
import { NewItemWsController } from "../../infrastructure/controllers/new-item.ws-controller";
import { AuctionUpdateWsController } from "../../infrastructure/controllers/auction-update.ws-controller";
import { CsgoempireAuctionHttpAdapter } from "../http/csgoempire/csgoempire-auction.http.adapter";
import { CsgoempireTradeHttpAdapter } from "../http/csgoempire/csgoempire-trade.http.adapter";
import {
    ACCOUNT_REPOSITORY,
    ACTIVE_TRADES_GATEWAY,
    ADD_WANTED_ITEM_HANDLER,
    AUCTION_GATEWAY,
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
    TOGGLE_WANTED_ITEM_HANDLER,
    TRACK_AUCTION_HANDLER,
    WANTED_ITEM_REPOSITORY,
} from "./bidding.identifiers";

const COMMAND_HANDLERS = [
    EVALUATE_ITEM_HANDLER,
    SYNC_ACCOUNT_HANDLER,
    ADD_WANTED_ITEM_HANDLER,
    EDIT_WANTED_ITEM_HANDLER,
    REMOVE_WANTED_ITEM_HANDLER,
    TOGGLE_WANTED_ITEM_HANDLER,
    PLACE_BID_HANDLER,
    LEAVE_AUCTION_HANDLER,
    TRACK_AUCTION_HANDLER,
];

export class BiddingModule extends ContainerModule {
    constructor() {
        super((options) => BiddingModule.bindAll(options));
    }

    private static bindAll(options: ContainerModuleLoadOptions): void {
        BiddingModule.bindCsgoempire(options);
        BiddingModule.bindRepositories(options);
        BiddingModule.bindWantedItemHandlers(options);
        BiddingModule.bindAuctionHandlers(options);
        BiddingModule.registerCommandHandlers(options);
        BiddingModule.bindEventListeners(options);
        BiddingModule.bindControllers(options);
    }

    private static bindCsgoempire({ bind }: ContainerModuleLoadOptions): void {
        bind(CSGOEMPIRE_AUCTION_HTTP)
            .toResolvedValue((client: HttpClient) => new CsgoempireAuctionHttpAdapter(client), [CSGOEMPIRE_HTTP_CLIENT])
            .inSingletonScope();
        bind(CSGOEMPIRE_TRADE_HTTP)
            .toResolvedValue((client: HttpClient) => new CsgoempireTradeHttpAdapter(client), [CSGOEMPIRE_HTTP_CLIENT])
            .inSingletonScope();
        bind(ACTIVE_TRADES_GATEWAY)
            .toResolvedValue(
                (http: CsgoempireTradeHttp) => new ActiveTradesGatewayCsgAdapter(http),
                [CSGOEMPIRE_TRADE_HTTP],
            )
            .inSingletonScope();
    }

    private static bindRepositories({ bind }: ContainerModuleLoadOptions): void {
        bind(ACCOUNT_REPOSITORY)
            .toResolvedValue(() => new AccountRepositoryInMemory())
            .inSingletonScope();
        bind(WANTED_ITEM_REPOSITORY)
            .toResolvedValue(() => new WantedItemRepositoryInMemory())
            .inSingletonScope();
        bind(AUCTION_PARTICIPATION_REPO)
            .toResolvedValue(() => new AuctionParticipationRepositoryInMemory())
            .inSingletonScope();
    }

    private static bindWantedItemHandlers({ bind }: ContainerModuleLoadOptions): void {
        bind(ADD_WANTED_ITEM_HANDLER)
            .toResolvedValue(
                (repo: WantedItemRepository) => new AddWantedItemCommandHandler(repo),
                [WANTED_ITEM_REPOSITORY],
            )
            .inSingletonScope();
        bind(EDIT_WANTED_ITEM_HANDLER)
            .toResolvedValue(
                (repo: WantedItemRepository) => new EditWantedItemCommandHandler(repo),
                [WANTED_ITEM_REPOSITORY],
            )
            .inSingletonScope();
        bind(REMOVE_WANTED_ITEM_HANDLER)
            .toResolvedValue(
                (repo: WantedItemRepository) => new RemoveWantedItemCommandHandler(repo),
                [WANTED_ITEM_REPOSITORY],
            )
            .inSingletonScope();
        bind(TOGGLE_WANTED_ITEM_HANDLER)
            .toResolvedValue(
                (repo: WantedItemRepository) => new ToggleWantedItemCommandHandler(repo),
                [WANTED_ITEM_REPOSITORY],
            )
            .inSingletonScope();
        bind(EVALUATE_ITEM_HANDLER)
            .toResolvedValue(
                (repo: WantedItemRepository, logger: Logger, bus: EventBus) =>
                    new EvaluateItemCommandHandler(repo, logger, bus),
                [WANTED_ITEM_REPOSITORY, LOGGER, EVENT_BUS],
            )
            .inSingletonScope();
    }

    private static bindAuctionHandlers({ bind }: ContainerModuleLoadOptions): void {
        bind(SYNC_ACCOUNT_HANDLER)
            .toResolvedValue(BiddingModule.createSyncAccount, [
                AUCTION_GATEWAY,
                ACTIVE_TRADES_GATEWAY,
                ACCOUNT_REPOSITORY,
                LOGGER,
            ])
            .inSingletonScope();
        bind(PLACE_BID_HANDLER)
            .toResolvedValue(BiddingModule.createPlaceBid, [
                ACCOUNT_REPOSITORY,
                AUCTION_PARTICIPATION_REPO,
                LOGGER,
                AUCTION_GATEWAY,
                EVENT_BUS,
            ])
            .inSingletonScope();
        bind(LEAVE_AUCTION_HANDLER)
            .toResolvedValue(
                (repo: AuctionParticipationRepository) => new LeaveAuctionCommandHandler(repo),
                [AUCTION_PARTICIPATION_REPO],
            )
            .inSingletonScope();
        bind(TRACK_AUCTION_HANDLER)
            .toResolvedValue(
                (repo: AccountRepository, bus: EventBus) => new TrackAuctionUpdateCommandHandler(repo, bus),
                [ACCOUNT_REPOSITORY, EVENT_BUS],
            )
            .inSingletonScope();
    }

    private static registerCommandHandlers({ bind }: ContainerModuleLoadOptions): void {
        COMMAND_HANDLERS.forEach((handler) => bind(COMMAND_HANDLER).toService(handler));
    }

    private static bindEventListeners({ bind }: ContainerModuleLoadOptions): void {
        bind(ON_APPROVED_IN_AUCTION)
            .toResolvedValue((bus: CommandBus) => new OnItemApprovedInAuctionPlaceBid(bus), [COMMAND_BUS])
            .inSingletonScope();
        bind(ON_APPROVED_OFF_AUCTION)
            .toResolvedValue((bus: CommandBus) => new OnItemApprovedOffAuctionWithdraw(bus), [COMMAND_BUS])
            .inSingletonScope();
        bind(ON_OUTBID)
            .toResolvedValue(
                (repo: AuctionParticipationRepository, logger: Logger, bus: CommandBus) =>
                    new OnOutbidCounterBid(repo, logger, bus),
                [AUCTION_PARTICIPATION_REPO, LOGGER, COMMAND_BUS],
            )
            .inSingletonScope();
    }

    private static bindControllers({ bind }: ContainerModuleLoadOptions): void {
        bind(NEW_ITEM_CONTROLLER)
            .toResolvedValue(
                (ws: CsgWsClient, bus: CommandBus) => new NewItemWsController(ws, bus),
                [CSG_WS_CLIENT, COMMAND_BUS],
            )
            .inSingletonScope();
        bind(AUCTION_UPDATE_CONTROLLER)
            .toResolvedValue(
                (ws: CsgWsClient, bus: CommandBus) => new AuctionUpdateWsController(ws, bus),
                [CSG_WS_CLIENT, COMMAND_BUS],
            )
            .inSingletonScope();
    }

    private static createSyncAccount(
        auctionGateway: AuctionGateway,
        activeTradesGateway: ActiveTradesGateway,
        accountRepository: AccountRepository,
        logger: Logger,
    ): SynchronizeAccountCommandHandler {
        return new SynchronizeAccountCommandHandler(auctionGateway, activeTradesGateway, accountRepository, logger);
    }

    private static createPlaceBid(
        accountRepository: AccountRepository,
        participationRepository: AuctionParticipationRepository,
        logger: Logger,
        auctionGateway: AuctionGateway,
        eventBus: EventBus,
    ): PlaceBidCommandHandler {
        return new PlaceBidCommandHandler(accountRepository, participationRepository, logger, auctionGateway, eventBus);
    }
}
