import type { Container } from "inversify";
import { HttpServerExpressAdapter } from "@/packages/external/http/server/http-server.express-adapter";
import { WsServerSocketIoAdapter } from "@/packages/external/web-socket/server/ws-server.socket-io-adapter";
import type { HttpServer } from "@/packages/infrastructure/http/http-server";
import type { WsServer } from "@/packages/infrastructure/web-socket/ws-server";
import { initAuthenticatedFake, initGuestFake } from "./__mocks__/init.mock";
import { getSktMetafakeResponse } from "@/contexts/trading/shared/external/csgoempire/http/socket-metadata.http.fake-adapter";
import { BaseError } from "@/packages/building-blocks/base-error";
import { CsgWsClientFakeAdapter } from "../../external/csgoempire/csg-ws-client.fake-adapter";
import { testContainer } from "@/__builders__/test-container.builder";
import { LOGGER } from "@/packages/external/di/packages.identifiers";
import {
    CSG_WS_CLIENT,
    INIT_CSG_SESSION,
    SOCKET_METADATA_HTTP,
} from "@/contexts/trading/shared/external/di/trading-shared.identifiers";

const PORT = 8888;

let container: Container;
let httpServer: HttpServer;
let wsServer: WsServer;

beforeEach(() => {
    container = testContainer();
    httpServer = new HttpServerExpressAdapter();
    wsServer = new WsServerSocketIoAdapter((httpServer as HttpServerExpressAdapter).http);
    container.rebind(CSG_WS_CLIENT).toConstantValue(new CsgWsClientFakeAdapter(`ws://localhost:${PORT}`));
    httpServer.listen(PORT);
});

afterEach(async () => {
    container.get(CSG_WS_CLIENT).close();
    await httpServer.close();
});

describe("InitWsController", () => {
    it("Should emit 'filters' socket when user is authenticated", (done) => {
        const csgWsClient = container.get(CSG_WS_CLIENT);
        const emitSpy = jest.spyOn(csgWsClient, "emit");
        const getMetadataSpy = jest.spyOn(container.get(SOCKET_METADATA_HTTP), "getSocketMetadata");
        const logSpy = jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});
        container.get(INIT_CSG_SESSION);
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
    it("Should fetch user metadata and emit 'identify' socket when user is not authenticated", async () => {
        const csgWsClient = container.get(CSG_WS_CLIENT);
        const emitSpy = jest.spyOn(csgWsClient, "emit");
        const getMetadataSpy = jest.spyOn(container.get(SOCKET_METADATA_HTTP), "getSocketMetadata");
        jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});
        const identified = new Promise<void>((resolve) => emitSpy.mockImplementationOnce(() => resolve()));
        container.get(INIT_CSG_SESSION);
        wsServer.on("connection", (socket) => {
            socket.emit("init", initGuestFake);
        });

        await identified;

        expect(getMetadataSpy).toHaveBeenCalledTimes(1);
        expect(emitSpy).toHaveBeenCalledTimes(1);
        expect(emitSpy).toHaveBeenCalledWith("identify", {
            uid: getSktMetafakeResponse.user.id,
            model: getSktMetafakeResponse.user,
            authorizationToken: getSktMetafakeResponse.socket_token,
            signature: getSktMetafakeResponse.socket_signature,
        });
    });
    it("Should log when socket metadata gateway breaks", async () => {
        const csgWsClient = container.get(CSG_WS_CLIENT);
        const emitSpy = jest.spyOn(csgWsClient, "emit");
        const onSpy = jest.spyOn(csgWsClient, "on");
        jest.spyOn(container.get(SOCKET_METADATA_HTTP), "getSocketMetadata").mockRejectedValue(
            new BaseError({ message: "Gateway down" }),
        );
        const logSpy = jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});
        container.get(INIT_CSG_SESSION);
        const initHandler = onSpy.mock.calls.find(([event]) => event === "init")![1];

        await expect(initHandler(initGuestFake)).rejects.toThrow("Gateway down");

        expect(emitSpy).not.toHaveBeenCalled();
        expect(logSpy).toHaveBeenCalledTimes(1);
    });
});
