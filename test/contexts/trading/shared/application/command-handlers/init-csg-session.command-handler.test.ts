import { InitializeCsgoempireSessionCommand } from "@/contexts/trading/shared/application/commands/initialize-csgoempire-session.command";
import { getSktMetafakeResponse } from "@/contexts/trading/shared/external/csgoempire/http/socket-metadata.fake";
import type { CommandHandler } from "@/shared/building-blocks/command-handler";
import { HttpServerExpressAdapter } from "@/shared/external/http/server/http-server.express-adapter";
import type { HttpServer } from "@/shared/infrastructure/http/http-server";
import type { WsClient } from "@/shared/infrastructure/web-socket/ws-client";
import type { Mock } from "bun:test";

const PORT = 8888;

let socketMetadataGateway: SocketMetadataGateway;
let handler: CommandHandler<InitializeCsgoempireSessionCommand>;
let httpServer: HttpServer;
let publishSpy: Mock<WsClient["emit"]>;
describe("InitCsgSessionCommandHandler", () => {
    beforeEach(() => {
        socketMetadataGateway = new SocketMetadataGatewayHttp();
        handler = new InitCsgSessionCommandHandler(socketMetadataGateway);
        httpServer = new HttpServerExpressAdapter();
        httpServer.listen(PORT);
    });
    it("Should publish a identificated event when user is not authenticated", async () => {
        await handler.handle(new InitializeCsgoempireSessionCommand(false));
        expect(wsEmitSpy).toHaveBeenCalledTimes(1);
        expect(wsEmitSpy).toHaveBeenCalledWith("identify", {
            uid: getSktMetafakeResponse.user.id,
            model: getSktMetafakeResponse.user,
            authorizationToken: getSktMetafakeResponse.socket_token,
            signature: getSktMetafakeResponse.socket_signature,
        });
    });
    it("Should publish a identificated event when user is authenticated", async () => {
        await handler.handle(new InitializeCsgoempireSessionCommand(true));
        expect(wsEmitSpy).toHaveBeenCalledTimes(1);
        expect(wsEmitSpy).toHaveBeenCalledWith("filters", {
            price_max: 9999999,
        });
    });
});
