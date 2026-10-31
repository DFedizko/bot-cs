import { newItem } from "./__mocks__/new-item.mock";
import type { WsServer } from "@/packages/infrastructure/web-socket/ws-server";
import { NewItemWsController } from "@/contexts/trading/bidding/infrastructure/controllers/new-item.ws-controller";
import type { HttpServer } from "@/packages/infrastructure/http/http-server";
import type { Mock } from "bun:test";
import { WsServerSocketIoAdapter } from "@/packages/external/web-socket/server/ws-server.socket-io-adapter";
import { HttpServerExpressAdapter } from "@/packages/external/http/server/http-server.express-adapter";
import type { CommandBus } from "@/packages/application/command-bus";
import { CommandBusInMemory } from "@/packages/infrastructure/command-bus/command-bus.in-memory";
import { EvaluateItemCommand } from "@/contexts/trading/bidding/application/evaluate-item/evaluate-item.command";
import type { CsgWsClient } from "@/contexts/trading/shared/infrastructure/csgoempire/csg.ws-client";
import { CsgWsClientFakeAdapter } from "@/contexts/trading/shared/external/csgoempire/csg-ws-client.fake-adapter";

const PORT = 8888;

let httpServer: HttpServer;
let wsServer: WsServer;
let csgWsClient: CsgWsClient;
let commandBus: CommandBus;
let dispatchSpy: Mock<CommandBus["dispatch"]>;
beforeEach(async () => {
    httpServer = new HttpServerExpressAdapter();
    wsServer = new WsServerSocketIoAdapter((httpServer as HttpServerExpressAdapter).http);
    csgWsClient = new CsgWsClientFakeAdapter(`ws://localhost:${PORT}`);
    commandBus = new CommandBusInMemory();
    commandBus.register({ handle: async () => {}, subscribedTo: () => EvaluateItemCommand.COMMAND_NAME });
    dispatchSpy = jest.spyOn(commandBus, "dispatch");
    new NewItemWsController(csgWsClient, commandBus);
    httpServer.listen(PORT);
    wsServer.on("connection", (socket) => {
        socket.emit("new_item", newItem);
    });
});

afterEach(async () => {
    await httpServer.close();
    csgWsClient.close();
});

describe("NewItemWsController", () => {
    it("Should receive a new item and publish a command to evaluate it", (done) => {
        csgWsClient.on("new_item", () => {
            const commands = dispatchSpy.mock.calls as [EvaluateItemCommand][];
            const commandPayloads = commands.flatMap(([command]) => ({
                itemId: command.itemId,
                accountId: command.accountId,
                itemName: command.itemName,
                numberOfBids: command.numberOfBids,
                price: command.price,
                referencePrice: command.referencePrice,
                aboveRecommendedPercentage: command.aboveRecommendedPercentage,
                inAuction: command.inAuction,
            }));
            expect(dispatchSpy).toHaveBeenCalledTimes(3);
            expect(commandPayloads).toEqual(
                newItem.map((item) => ({
                    itemId: item.id,
                    accountId: csgWsClient.accountId,
                    itemName: item.market_name,
                    numberOfBids: item.auction_number_of_bids,
                    price: item.purchase_price,
                    referencePrice: item.suggested_price,
                    aboveRecommendedPercentage: item.above_recommended_price.toString(),
                    inAuction: !!item.auction_ends_at,
                })),
            );
            done();
        });
    });
});
