import type { EventBus } from "@/shared/application/event-bus";
import { EventBusInMemoryAsync } from "@/shared/external/event-bus/event-bus.in-memory-async";
import { newItem } from "./__mocks__/new-item.mock";
import type { WsClient } from "@/shared/infrastructure/web-socket/ws-client";
import { HttpServerBunAdapter } from "@/shared/external/http/server/http-server.bun-adapter";
import { WsServerBunAdapter } from "@/shared/external/web-socket/server/ws-server.bun-adapter";
import { WsClientBunAdapter } from "@/shared/external/web-socket/client/ws-client.bun-adapter";
import type { WsServer } from "@/shared/infrastructure/web-socket/ws-server";
import { OnNewItemWsController } from "@/contexts/trading/bidding/infrastructure/controllers/on-new-item.ws-controller";
import type { HttpServer } from "@/shared/infrastructure/http/http-server";
import type { Mock } from "bun:test";

const PORT = 8888;

let httpServer: HttpServer;
let wsServer: WsServer;
let wsClient: WsClient;
let eventBus: EventBus;
let publishSpy: Mock<EventBus["publish"]>;
beforeEach(async () => {
    wsServer = new WsServerBunAdapter();
    wsClient = new WsClientBunAdapter(`ws://localhost:${PORT}`);
    eventBus = new EventBusInMemoryAsync();
    publishSpy = jest.spyOn(eventBus, "publish");
    httpServer = new HttpServerBunAdapter(wsServer as WsServerBunAdapter);
    new OnNewItemWsController(wsClient, eventBus);
    httpServer.listen(PORT);
    wsServer.on("connection", (socket) => {
        socket.emit("new_item", newItem);
    });
});

afterEach(async () => {
    await httpServer.close();
    wsClient.close();
});

describe("WsOnNewItemController", () => {
    it("Should receive a new item and publish ", (done) => {
        wsClient.on("new_item", () => {
            const [events] = publishSpy.mock.calls[0];
            expect(publishSpy).toHaveBeenCalled();
            expect(events.map((event) => event.payload)).toEqual(
                newItem.map((item) => ({
                    itemId: item.id,
                    itemName: item.market_name,
                    numberOfBids: item.auction_number_of_bids,
                    price: item.purchase_price,
                    referencePrice: item.suggested_price,
                    aboveRecommendedPercentage: item.above_recommended_price.toString(),
                })),
            );
            done();
        });
    });
});
