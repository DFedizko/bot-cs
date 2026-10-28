import { registerBiddingEvents } from "./contexts/trading/bidding";
import { NewItemWsController } from "./contexts/trading/bidding/infrastructure/controllers/new-item.ws-controller";
import { CsgoempireWsClient } from "./contexts/trading/shared/external/csgoempire/csgoempire.ws-client";
import { CsgoempireHttpClientFactory } from "./contexts/trading/shared/external/csgoempire/http/csgoempire.http-client";
import { SocketMetadataHttp } from "./contexts/trading/shared/external/csgoempire/http/socket-metadata.gateway.http";
import { InitCsgSessionWsController } from "./contexts/trading/shared/infrastructure/controllers/init-csg-session.ws-controller";
import { CommandBusInMemory } from "./packages/external/command-bus/command-bus.in-memory";
import { EnvZodAdapter } from "./packages/external/environment/env.zod-adapter";
import { EventBusInMemoryAsync } from "./packages/external/event-bus/event-bus.in-memory-async";
import { HttpClientFactoryAdapter } from "./packages/external/http/client/http-client.factory.adapter";
import { CommandHandlers } from "./packages/infrastructure/command-bus/command-handlers";
import { LoggerConsoleAdapter } from "./packages/infrastructure/logger/logger.console-adapter";

const env = new EnvZodAdapter().parse(Bun.env);
const httpClientFactory = new HttpClientFactoryAdapter("axios");
const csgoempireHttpClient = CsgoempireHttpClientFactory.create(httpClientFactory, env.CSGOEMPIRE_API_KEY);
const socketMetadata = new SocketMetadataHttp(csgoempireHttpClient);
const eventBus = new EventBusInMemoryAsync();
const commandHandlers = new CommandHandlers([]);
const commandBusInMemory = new CommandBusInMemory(commandHandlers);
const logger = new LoggerConsoleAdapter();

const bootstrap = async () => {
    registerBiddingEvents(eventBus, commandBusInMemory, logger);

    const metadata = await socketMetadata.getSocketMetadata();
    const wsClient = new CsgoempireWsClient({ id: metadata.user.id, socketToken: metadata.socket_token });

    wsClient.on("connect", async () => {
        logger.log(`Connected to websocket`);
        new InitCsgSessionWsController(wsClient, socketMetadata, logger);
        new NewItemWsController(wsClient, eventBus);
    });
};

await bootstrap();
