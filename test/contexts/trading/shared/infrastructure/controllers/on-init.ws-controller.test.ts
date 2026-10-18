import { OnInitWsController } from "@/contexts/trading/shared/infrastructure/controllers/on-init.ws-controller";
import { HttpServerExpressAdapter } from "@/shared/external/http/server/http-server.express-adapter";
import { WsClientSocketIoAdapter } from "@/shared/external/web-socket/client/ws-client.socket-io-adapter";
import { WsServerSocketIoAdapter } from "@/shared/external/web-socket/server/ws-server.socket-io-adapter";
import type { HttpServer } from "@/shared/infrastructure/http/http-server";
import type { WsClient } from "@/shared/infrastructure/web-socket/ws-client";
import type { WsServer } from "@/shared/infrastructure/web-socket/ws-server";
import type { Mock } from "bun:test";
import type { CommandBus } from "@/shared/infrastructure/command-bus/command-bus";
import { initGuestFake } from "./__mocks__/init.mock";
import { CommandBusInMemory } from "@/shared/external/command-bus/command-bus.in-memory";
import { CommandHandlers } from "@/shared/infrastructure/command-bus/command-handlers";
import { InitializeCsgoempireSessionCommand } from "@/contexts/trading/shared/application/commands/initialize-csgoempire-session.command";

const PORT = 8888;

let httpServer: HttpServer;
let wsServer: WsServer;
let wsClient: WsClient;
let commandBus: CommandBus;
let dispatchSpy: Mock<CommandBus["dispatch"]>;

beforeEach(async () => {
    httpServer = new HttpServerExpressAdapter();
    wsServer = new WsServerSocketIoAdapter((httpServer as HttpServerExpressAdapter).http);
    wsClient = new WsClientSocketIoAdapter(`ws://localhost:${PORT}`);
    commandBus = new CommandBusInMemory(
        new CommandHandlers([
            { handle: async () => {}, subscribedTo: () => InitializeCsgoempireSessionCommand.COMMAND_NAME },
        ]),
    );
    dispatchSpy = jest.spyOn(commandBus, "dispatch");
    new OnInitWsController(wsClient, commandBus);
    httpServer.listen(PORT);
    wsServer.on("connection", (socket) => {
        socket.emit("init", initGuestFake);
    });
});
describe("OnInitWsController", () => {
    it("Should receive 'init' socket and send a command to initialize the session", (done) => {
        wsClient.on("init", () => {
            const [command] = dispatchSpy.mock.calls[0];
            expect(command.name).toBe(InitializeCsgoempireSessionCommand.COMMAND_NAME);
            expect((command as InitializeCsgoempireSessionCommand).authenticated).toBe(false);
            expect(dispatchSpy).toHaveBeenCalledWith(command);
            done();
        });
    });
});
