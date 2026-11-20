import { HttpServerExpressAdapter } from "@/packages/external/http/server/http-server.express-adapter";
import { WsServerSocketIoAdapter } from "@/packages/external/web-socket/server/ws-server.socket-io-adapter";
import type { HttpServer } from "@/packages/infrastructure/http/http-server";
import type { WsServer } from "@/packages/infrastructure/web-socket/ws-server";
import type { Mock } from "bun:test";
import { initAuthenticatedFake, initGuestFake } from "./__mocks__/init.mock";
import type { SocketMetadataHttp } from "@/contexts/trading/shared/infrastructure/csgoempire/http/socket-metadata.http";
import { getSktMetafakeResponse } from "@/contexts/trading/shared/external/csgoempire/http/socket-metadata.http.fake-adapter";
import type { Logger } from "@/packages/application/logger";
import { BaseError } from "@/packages/building-blocks/base-error";
import type { CsgWsClient } from "@/contexts/trading/shared/infrastructure/csgoempire/csg.ws-client";
import { CsgWsClientFakeAdapter } from "../../external/csgoempire/csg-ws-client.fake-adapter";
import { testContainer } from "@/__builders__/test-container.builder";
import { LOGGER } from "@/packages/external/di/packages.identifiers";
import {
    CSG_WS_CLIENT,
    INIT_CSG_SESSION,
    SOCKET_METADATA_HTTP,
} from "@/contexts/trading/shared/external/di/trading-shared.identifiers";

const PORT = 8888;

let httpServer: HttpServer;
let wsServer: WsServer;
let csgWsClient: CsgWsClient;
let emitSpy: Mock<CsgWsClient["emit"]>;
let onSpy: Mock<CsgWsClient["on"]>;
let socketMetadataGateway: SocketMetadataHttp;
let getMetadataSpy: Mock<SocketMetadataHttp["getSocketMetadata"]>;
let logger: Logger;
let logSpy: Mock<Logger["log"]>;

beforeEach(async () => {
    httpServer = new HttpServerExpressAdapter();
    wsServer = new WsServerSocketIoAdapter((httpServer as HttpServerExpressAdapter).http);
    const container = testContainer();
    csgWsClient = new CsgWsClientFakeAdapter(`ws://localhost:${PORT}`);
    container.rebind(CSG_WS_CLIENT).toConstantValue(csgWsClient);
    emitSpy = jest.spyOn(csgWsClient, "emit");
    onSpy = jest.spyOn(csgWsClient, "on");
    socketMetadataGateway = container.get(SOCKET_METADATA_HTTP);
    getMetadataSpy = jest.spyOn(socketMetadataGateway, "getSocketMetadata");
    logger = container.get(LOGGER);
    logSpy = jest.spyOn(logger, "log").mockImplementation(() => {});
    container.get(INIT_CSG_SESSION);
    httpServer.listen(PORT);
});

afterEach(async () => {
    csgWsClient.close();
    await httpServer.close();
});

describe("InitWsController", () => {
    it("Should emit 'filters' socket when user is authenticated", (done) => {
        wsServer.on("connection", (socket) => {
            socket.emit("init", initAuthenticatedFake);
        });
        csgWsClient.on("init", () => {
            expect(getMetadataSpy).not.toHaveBeenCalled();
            expect(logSpy).toHaveBeenCalledTimes(1);
            expect(logSpy).toHaveBeenCalledWith("Successfully authenticated in csgoempire as fake_trader");
            expect(emitSpy).toHaveBeenCalledWith("filters", { price_max: 9999999 });
            done();
        });
    });
    it("Should fetch user metadata and emit 'identify' socket when user is not authenticated", async (done) => {
        const emitted = new Promise((resolve) => {
            resolve(emitSpy);
        });
        wsServer.on("connection", (socket) => {
            socket.emit("init", initGuestFake);
        });
        await emitted;
        csgWsClient.on("init", () => {
            expect(getMetadataSpy).toHaveBeenCalledTimes(1);
            expect(emitSpy).toHaveBeenCalledTimes(1);
            expect(emitSpy).toHaveBeenCalledWith("identify", {
                uid: getSktMetafakeResponse.user.id,
                model: getSktMetafakeResponse.user,
                authorizationToken: getSktMetafakeResponse.socket_token,
                signature: getSktMetafakeResponse.socket_signature,
            });
            done();
        });
    });
    it("Should log when socket metadata gateway breaks", () => {
        getMetadataSpy.mockRejectedValue(new BaseError({ message: "Gateway down" }));
        const initHandler = onSpy.mock.calls.find(([event]) => event === "init")![1];
        expect(initHandler(initGuestFake)).rejects.toThrow("Gateway down");
        expect(emitSpy).not.toHaveBeenCalled();
        expect(logSpy).toHaveBeenCalledTimes(1);
    });
});
