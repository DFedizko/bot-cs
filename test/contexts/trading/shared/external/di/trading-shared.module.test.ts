import { Container } from "inversify";
import { PackagesModule } from "@/packages/external/di/packages.module";
import { TradingSharedModule } from "@/contexts/trading/shared/external/di/trading-shared.module";
import {
    CSG_WS_CLIENT,
    CSGOEMPIRE_HTTP_CLIENT,
    INIT_CSG_SESSION,
    SOCKET_METADATA,
    SOCKET_METADATA_HTTP,
} from "@/contexts/trading/shared/external/di/trading-shared.identifiers";
import { HttpClientAxiosAdapter } from "@/packages/external/http/client/http-client.axios-adapter";
import { SocketMetadataHttpAdapter } from "@/contexts/trading/shared/external/csgoempire/http/socket-metadata.http.adapter";
import { InitCsgSessionWsController } from "@/contexts/trading/shared/infrastructure/controllers/init-csg-session.ws-controller";
import {
    getSktMetafakeResponse,
    SocketMetadataHttpFakeAdapter,
} from "../csgoempire/http/socket-metadata.http.fake-adapter";
import { CsgWsClientFakeAdapter } from "../csgoempire/csg-ws-client.fake-adapter";

const API_KEY = "api-key";
const ANY_FREE_PORT = 0;
const FAKE_WS_URL = "ws://localhost";
const ENVIRONMENTS: AppEnv["NODE_ENV"][] = ["development", "production"];

let container: Container;

describe.each(ENVIRONMENTS)("TradingSharedModule in %s", (nodeEnv) => {
    beforeEach(() => {
        container = new Container();
        container.load(
            new PackagesModule({ NODE_ENV: nodeEnv, CSGOEMPIRE_API_KEY: API_KEY, HTTP_PORT: ANY_FREE_PORT }),
            new TradingSharedModule(),
        );
    });

    it("Should bind the csgoempire http client", () => {
        const httpClient = container.get(CSGOEMPIRE_HTTP_CLIENT);

        expect(httpClient).toBeInstanceOf(HttpClientAxiosAdapter);
    });

    it("Should bind the csgoempire socket metadata http adapter", () => {
        const socketMetadataHttp = container.get(SOCKET_METADATA_HTTP);

        expect(socketMetadataHttp).toBeInstanceOf(SocketMetadataHttpAdapter);
    });

    it("Should bind the socket metadata fetched from csgoempire", async () => {
        container.rebind(SOCKET_METADATA_HTTP).toConstantValue(new SocketMetadataHttpFakeAdapter());

        const metadata = await container.getAsync(SOCKET_METADATA);

        expect(metadata).toEqual(getSktMetafakeResponse);
    });

    it("Should bind the csgoempire ws client", () => {
        const isBound = container.isBound(CSG_WS_CLIENT);

        expect(isBound).toBeTrue();
    });

    it("Should bind the session controller to the ws client", async () => {
        container.rebind(SOCKET_METADATA_HTTP).toConstantValue(new SocketMetadataHttpFakeAdapter());
        container
            .rebind(CSG_WS_CLIENT)
            .toConstantValue(new CsgWsClientFakeAdapter(FAKE_WS_URL, { autoConnect: false }));

        const controller = await container.getAsync(INIT_CSG_SESSION);

        expect(controller).toBeInstanceOf(InitCsgSessionWsController);
    });
});
