import { registerBiddingEvents } from "./contexts/trading/bidding";
import { NewItemWsController } from "./contexts/trading/bidding/infrastructure/controllers/new-item.ws-controller";
import { CsgoempireWsClient } from "./contexts/trading/shared/external/csgoempire/csgoempire.ws-client";
import { CsgoempireHttpClientFactory } from "./contexts/trading/shared/external/csgoempire/http/csgoempire.http-client";
import { SocketMetadataHttpAdapter } from "./contexts/trading/shared/external/csgoempire/http/socket-metadata.http.adapter";
import { InitCsgSessionWsController } from "./contexts/trading/shared/infrastructure/controllers/init-csg-session.ws-controller";
import { CommandBusInMemory } from "./packages/infrastructure/command-bus/command-bus.in-memory";
import { EnvZodAdapter } from "./packages/external/environment/env.zod-adapter";
import { EventBusInMemoryAsync } from "./packages/external/event-bus/event-bus.in-memory-async";
import { HttpClientFactoryAdapter } from "./packages/external/http/client/http-client.factory.adapter";
import { LoggerConsoleAdapter } from "./packages/infrastructure/logger/logger.console-adapter";
import { SynchronizeAccountCommandHandler } from "./contexts/trading/bidding/application/synchronize-account/synchronize-account.command-handler";
import { AuctionGatewayCsgoempireAdapter } from "./contexts/trading/bidding/infrastructure/gateways/auction.gateway.csgoempire-adapter";
import { CsgoempireAuctionHttpAdapter } from "./contexts/trading/bidding/external/http/csgoempire/csgoempire-auction.http.adapter";
import { CsgoempireTradeHttpAdapter } from "./contexts/trading/bidding/external/http/csgoempire/csgoempire-trade.http.adapter";
import { ActiveTradesGatewayCsgAdapter } from "./contexts/trading/bidding/infrastructure/gateways/active-trades.gateway.csg-adapter";
import { AccountRepositoryInMemory } from "./contexts/trading/bidding/infrastructure/repositories/account.repository.in-memory";
import { SynchronizeAccountCommand } from "./contexts/trading/bidding/application/synchronize-account/synchronize-account.command";

const env = new EnvZodAdapter().parse(Bun.env);
const httpClientFactory = new HttpClientFactoryAdapter("axios");
const csgoempireHttpClient = CsgoempireHttpClientFactory.create(httpClientFactory, env.CSGOEMPIRE_API_KEY);
const eventBus = new EventBusInMemoryAsync();
const commandBus = new CommandBusInMemory();
const logger = new LoggerConsoleAdapter();
const socketMetadata = new SocketMetadataHttpAdapter(csgoempireHttpClient);

const csgAuctionHttp = new CsgoempireAuctionHttpAdapter(csgoempireHttpClient);
const csgTradeHttp = new CsgoempireTradeHttpAdapter(csgoempireHttpClient);
const auctionGateway = new AuctionGatewayCsgoempireAdapter(csgAuctionHttp);
const activeTradesGateway = new ActiveTradesGatewayCsgAdapter(csgTradeHttp);
const accountRepository = new AccountRepositoryInMemory();

// synchronize account
const synchronizeAccountCommandHandler = new SynchronizeAccountCommandHandler(
    auctionGateway,
    activeTradesGateway,
    accountRepository,
    logger,
);

const bootstrap = async () => {
    registerBiddingEvents(eventBus, commandBus, logger);
    const metadata = await socketMetadata.getSocketMetadata();
    const csgWsClient = new CsgoempireWsClient({ id: metadata.user.id, socketToken: metadata.socket_token });
    new InitCsgSessionWsController(csgWsClient, socketMetadata, logger);
    await synchronizeAccountCommandHandler.handle(
        new SynchronizeAccountCommand(metadata.user.id, metadata.user.steam_name, metadata.user.balance),
    );
    new NewItemWsController(csgWsClient, commandBus);
};

await bootstrap();
