import { HttpServerExpressAdapter } from "@/packages/external/http/server/http-server.express-adapter";
import { WsClientSocketIoAdapter } from "@/packages/external/web-socket/client/ws-client.socket-io-adapter";
import { WsServerSocketIoAdapter } from "@/packages/external/web-socket/server/ws-server.socket-io-adapter";
import type { HttpServer } from "@/packages/infrastructure/http/http-server";
import type { WsClient } from "@/packages/infrastructure/web-socket/ws-client";
import type { WsServer } from "@/packages/infrastructure/web-socket/ws-server";
import type { Mock } from "bun:test";
import { initAuthenticatedFake, initGuestFake } from "./__mocks__/init.mock";
import type { SocketMetadataGateway } from "@/contexts/trading/shared/infrastructure/csgoempire/http/socket-metadata.gateway";
import { InitCsgSessionWsController } from "@/contexts/trading/shared/infrastructure/controllers/init-csg-session.ws-controller";
import {
    getSktMetafakeResponse,
    SocketMetadataGatewayFake,
} from "@/contexts/trading/shared/external/csgoempire/http/socket-metadata.gateway.fake";
import type { Logger } from "@/packages/application/logger";
import { BaseError } from "@/packages/building-blocks/base-error";

const PORT = 8888;

let httpServer: HttpServer;
let wsServer: WsServer;
let wsClient: WsClient;
let emitSpy: Mock<WsClient["emit"]>;
let socketMetadataGateway: SocketMetadataGateway;
let getMetadataSpy: Mock<SocketMetadataGateway["getSocketMetadata"]>;
let logger: Logger;
let logSpy: Mock<Logger["log"]>;

beforeEach(async () => {
    httpServer = new HttpServerExpressAdapter();
    wsServer = new WsServerSocketIoAdapter((httpServer as HttpServerExpressAdapter).http);
    wsClient = new WsClientSocketIoAdapter(`ws://localhost:${PORT}`);
    emitSpy = jest.spyOn(wsClient, "emit");
    socketMetadataGateway = new SocketMetadataGatewayFake();
    getMetadataSpy = jest.spyOn(socketMetadataGateway, "getSocketMetadata");
    logger = { log: () => {} };
    logSpy = jest.spyOn(logger, "log");
    new InitCsgSessionWsController(wsClient, socketMetadataGateway, logger);
    httpServer.listen(PORT);
});

afterEach(async () => {
    await httpServer.close();
    wsClient.close();
});

describe("InitWsController", () => {
    it("Should emit 'filters' socket when user is authenticated", (done) => {
        wsServer.on("connection", (socket) => {
            socket.emit("init", initAuthenticatedFake);
        });
        wsClient.on("init", () => {
            expect(getMetadataSpy).not.toHaveBeenCalled();
            expect(logSpy).toHaveBeenCalledTimes(1);
            expect(logSpy).toHaveBeenCalledWith("Successfully authenticated as fake_trader");
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
        wsClient.on("init", () => {
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
        const onSpy = jest.spyOn(wsClient, "on");
        new InitCsgSessionWsController(wsClient, socketMetadataGateway, logger);
		const initHandler = onSpy.mock.calls.find(([event]) => event === "init")![1];
        expect(initHandler(initGuestFake)).rejects.toThrow("Gateway down");
        expect(emitSpy).not.toHaveBeenCalled();
        expect(logSpy).toHaveBeenCalledTimes(1);
    });
});
