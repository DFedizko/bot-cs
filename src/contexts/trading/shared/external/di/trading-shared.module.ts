import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { ENV, HTTP_CLIENT_FACTORY, LOGGER } from "@/packages/external/di/packages.identifiers";
import type { Logger } from "@/packages/application/logger";
import type { HttpClientFactory } from "@/packages/external/http/client/http-client.factory";
import type { HttpClient } from "@/packages/infrastructure/http/http-client";
import { CsgoempireHttpClientFactory } from "../csgoempire/http/csgoempire.http-client";
import { SocketMetadataHttpAdapter } from "../csgoempire/http/socket-metadata.http.adapter";
import { CsgoempireWsClient } from "../csgoempire/csgoempire.ws-client";
import { InitCsgSessionWsController } from "../../infrastructure/controllers/init-csg-session.ws-controller";
import type { CsgWsClient } from "../../infrastructure/csgoempire/csg.ws-client";
import type {
    GetSocketMetadataIO,
    SocketMetadataHttp,
} from "../../infrastructure/csgoempire/http/socket-metadata.http";
import {
    CSG_WS_CLIENT,
    CSGOEMPIRE_HTTP_CLIENT,
    INIT_CSG_SESSION,
    SOCKET_METADATA,
    SOCKET_METADATA_HTTP,
} from "./trading-shared.identifiers";

export class TradingSharedModule extends ContainerModule {
    constructor() {
        super((options) => TradingSharedModule.bindAll(options));
    }

    private static bindAll({ bind }: ContainerModuleLoadOptions): void {
        bind(CSGOEMPIRE_HTTP_CLIENT)
            .toResolvedValue(TradingSharedModule.createHttpClient, [HTTP_CLIENT_FACTORY, ENV])
            .inSingletonScope();
        bind(SOCKET_METADATA_HTTP)
            .toResolvedValue(
                (httpClient: HttpClient) => new SocketMetadataHttpAdapter(httpClient),
                [CSGOEMPIRE_HTTP_CLIENT],
            )
            .inSingletonScope();
        bind(SOCKET_METADATA)
            .toResolvedValue((http: SocketMetadataHttp) => http.getSocketMetadata(), [SOCKET_METADATA_HTTP])
            .inSingletonScope();
        bind(CSG_WS_CLIENT).toResolvedValue(TradingSharedModule.createWsClient, [SOCKET_METADATA]).inSingletonScope();
        bind(INIT_CSG_SESSION)
            .toResolvedValue(TradingSharedModule.createSession, [CSG_WS_CLIENT, SOCKET_METADATA_HTTP, LOGGER])
            .inSingletonScope();
    }

    private static createHttpClient(factory: HttpClientFactory, env: AppEnv): HttpClient {
        return CsgoempireHttpClientFactory.create(factory, env.CSGOEMPIRE_API_KEY);
    }

    private static createWsClient(metadata: GetSocketMetadataIO.Response): CsgWsClient {
        return new CsgoempireWsClient({ id: metadata.user.id, socketToken: metadata.socket_token });
    }

    private static createSession(
        wsClient: CsgWsClient,
        socketMetadataHttp: SocketMetadataHttp,
        logger: Logger,
    ): InitCsgSessionWsController {
        return new InitCsgSessionWsController(wsClient, socketMetadataHttp, logger);
    }
}
