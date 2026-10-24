import { OnNewItemWsController } from "./contexts/trading/bidding/infrastructure/controllers/on-new-item.ws-controller";
import { CsgoempireWsClient } from "./contexts/trading/shared/external/csgoempire/csgoempire.ws-client";
import { CsgoempireHttpClientFactory } from "./contexts/trading/shared/external/csgoempire/http/csgoempire.http-client";
import { SocketMetadataHttp } from "./contexts/trading/shared/external/csgoempire/http/socket-metadata.gateway.http";
import { InitCsgSessionWsController } from "./contexts/trading/shared/infrastructure/controllers/init-csg-session.ws-controller";
import { EnvZodAdapter } from "./shared/external/environment/env.zod-adapter";
import { HttpClientFactoryAdapter } from "./shared/external/http/client/http-client.factory.adapter";

const env = new EnvZodAdapter().parse(Bun.env);
const httpClientFactory = new HttpClientFactoryAdapter("axios");
const csgoempireHttpClient = CsgoempireHttpClientFactory.create(httpClientFactory, env.CSGOEMPIRE_API_KEY);
const socketMetadata = new SocketMetadataHttp(csgoempireHttpClient);
const logger = { log: (msg: string) => console.log(msg) };

const bootstrap = async () => {
    const metadata = await socketMetadata.getSocketMetadata();
    const wsClient = new CsgoempireWsClient({ id: metadata.user.id, socketToken: metadata.socket_token });

    wsClient.on("connect", async () => {
        logger.log(`Connected to websocket`);
        new InitCsgSessionWsController(wsClient, socketMetadata, logger);
        new OnNewItemWsController(wsClient, {
            addSubscribers: () => {},
            publish: async (e) => {
                logger.log(`Item: ${JSON.stringify(e, null, 2)}`);
            },
        });
    });
};

await bootstrap();
