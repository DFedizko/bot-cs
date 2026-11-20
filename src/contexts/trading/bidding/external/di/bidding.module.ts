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
import type { WantedItemRepository } from "../../application/wanted-item.repository";
import type { AuctionGateway } from "../../application/place-bid/auction.gateway";
import type { ActiveTradesGateway } from "../../application/synchronize-account/active-trades.gateway";
import type { CsgoempireTradeHttp } from "../../infrastructure/http/csgoempire/csgoempire-trade.http";
import { EvaluateItemCommandHandler } from "../../application/evaluate-item/evaluate-item.command-handler";
import { SynchronizeAccountCommandHandler } from "../../application/synchronize-account/synchronize-account.command-handler";
import { ActiveTradesGatewayCsgAdapter } from "../../infrastructure/gateways/active-trades.gateway.csg-adapter";
import { AccountRepositoryInMemory } from "../../infrastructure/repositories/account.repository.in-memory";
import { WantedItemRepositoryInMemory } from "../../infrastructure/repositories/wanted-item.repository.in-memory";
import { NewItemWsController } from "../../infrastructure/controllers/new-item.ws-controller";
import { CsgoempireAuctionHttpAdapter } from "../http/csgoempire/csgoempire-auction.http.adapter";
import { CsgoempireTradeHttpAdapter } from "../http/csgoempire/csgoempire-trade.http.adapter";
import {
    ACCOUNT_REPOSITORY,
    ACTIVE_TRADES_GATEWAY,
    AUCTION_GATEWAY,
    CSGOEMPIRE_AUCTION_HTTP,
    CSGOEMPIRE_TRADE_HTTP,
    NEW_ITEM_CONTROLLER,
    WANTED_ITEM_REPOSITORY,
} from "./bidding.identifiers";

export class BiddingModule extends ContainerModule {
    constructor() {
        super((options) => BiddingModule.bindAll(options));
    }

    private static bindAll(options: ContainerModuleLoadOptions): void {
        BiddingModule.bindCsgoempire(options);
        BiddingModule.bindRepositories(options);
        BiddingModule.bindCommandHandlers(options);
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
    }

    private static bindCommandHandlers({ bind }: ContainerModuleLoadOptions): void {
        bind(COMMAND_HANDLER)
            .toResolvedValue(BiddingModule.createEvaluateItem, [WANTED_ITEM_REPOSITORY, LOGGER, EVENT_BUS])
            .inSingletonScope();
        bind(COMMAND_HANDLER)
            .toResolvedValue(BiddingModule.createSyncAccount, [
                AUCTION_GATEWAY,
                ACTIVE_TRADES_GATEWAY,
                ACCOUNT_REPOSITORY,
                LOGGER,
            ])
            .inSingletonScope();
    }

    private static bindControllers({ bind }: ContainerModuleLoadOptions): void {
        bind(NEW_ITEM_CONTROLLER)
            .toResolvedValue(
                (ws: CsgWsClient, bus: CommandBus) => new NewItemWsController(ws, bus),
                [CSG_WS_CLIENT, COMMAND_BUS],
            )
            .inSingletonScope();
    }

    private static createEvaluateItem(
        repository: WantedItemRepository,
        logger: Logger,
        eventBus: EventBus,
    ): EvaluateItemCommandHandler {
        return new EvaluateItemCommandHandler(repository, logger, eventBus);
    }

    private static createSyncAccount(
        auctionGateway: AuctionGateway,
        activeTradesGateway: ActiveTradesGateway,
        accountRepository: AccountRepository,
        logger: Logger,
    ): SynchronizeAccountCommandHandler {
        return new SynchronizeAccountCommandHandler(auctionGateway, activeTradesGateway, accountRepository, logger);
    }
}
