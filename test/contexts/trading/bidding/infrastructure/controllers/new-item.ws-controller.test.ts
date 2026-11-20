import type { Container } from "inversify";
import { newItem } from "./__mocks__/new-item.mock";
import type { WsServer } from "@/packages/infrastructure/web-socket/ws-server";
import type { HttpServer } from "@/packages/infrastructure/http/http-server";
import { WsServerSocketIoAdapter } from "@/packages/external/web-socket/server/ws-server.socket-io-adapter";
import { HttpServerExpressAdapter } from "@/packages/external/http/server/http-server.express-adapter";
import type { EvaluateItemCommand } from "@/contexts/trading/bidding/application/evaluate-item/evaluate-item.command";
import { CsgWsClientFakeAdapter } from "@/contexts/trading/shared/external/csgoempire/csg-ws-client.fake-adapter";
import { testContainer } from "@/__builders__/test-container.builder";
import { COMMAND_BUS } from "@/packages/external/di/packages.identifiers";
import { CSG_WS_CLIENT } from "@/contexts/trading/shared/external/di/trading-shared.identifiers";
import { NEW_ITEM_CONTROLLER } from "@/contexts/trading/bidding/external/di/bidding.identifiers";

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
    wsServer.on("connection", (socket) => {
        socket.emit("new_item", newItem);
    });
});

afterEach(async () => {
    container.get(CSG_WS_CLIENT).close();
    await httpServer.close();
});

describe("NewItemWsController", () => {
    it("Should receive a new item and publish a command to evaluate it", (done) => {
        const csgWsClient = container.get(CSG_WS_CLIENT);
        const dispatchSpy = jest.spyOn(container.get(COMMAND_BUS), "dispatch").mockResolvedValue();
        container.get(NEW_ITEM_CONTROLLER);

        csgWsClient.on("new_item", () => {
            const commands = dispatchSpy.mock.calls as [EvaluateItemCommand][];
            const commandPayloads = commands.flatMap(([command]) => ({
                itemId: command.itemId,
                accountId: command.accountId,
                itemName: command.itemName,
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
