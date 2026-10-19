import { NewItemWsController } from "./contexts/trading/bidding/infrastructure/controllers/on-new-item.ws-controller";
import {
    CsgoempireUserData,
    CsgoempireWsClient,
} from "./contexts/trading/shared/external/csgoempire/csgoempire.ws-client";
import { CsgoempireHttpClientFactory } from "./contexts/trading/shared/external/csgoempire/http/csgoempire.http-client";
import { SocketMetadataHttp } from "./contexts/trading/shared/external/csgoempire/http/socket-metadata.http";
import { InitWsController } from "./contexts/trading/shared/infrastructure/controllers/on-init.ws-controller";
import { GetSocketMetadataIO } from "./contexts/trading/shared/infrastructure/csgoempire/http/socket-metadata";
import { EventBusInMemorySync } from "./shared/external/event-bus/event-bus.in-memory-sync";
import { HttpClientFactoryAdapter } from "./shared/external/http/client/http-client.factory.adapter";

const httpClientFactory = new HttpClientFactoryAdapter("axios");
const csgoempireHttpClient = CsgoempireHttpClientFactory.create(httpClientFactory, Bun.env.CSGOEMPIRE_API_KEY);
const socketMetadata = new SocketMetadataHttp(csgoempireHttpClient);

// class CsgoempireUserMetadata {
//     private readonly metadata: CsgoempireUserData;
//     private readonly refreshedAt: number;

//     constructor() {}
// }

const bootstrap = async () => {
    const userDataRefreshedAt = Date.now();
    const metadata = await socketMetadata.getSocketMetadata();

    const wsClient = new CsgoempireWsClient({ id: metadata.user.id, socketToken: metadata.socket_token });

    // const eventBusInMemorySync = new EventBusInMemorySync();

    wsClient.on("connect", async () => {
        console.log(`Connected to websocket`);
        new InitWsController(wsClient);
        // new NewItemWsController();
    });
};

await bootstrap();
