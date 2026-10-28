import type { EventBus } from "@/packages/application/event-bus";
import { EventBusInMemoryAsync } from "@/packages/external/event-bus/event-bus.in-memory-async";
import { newItem } from "./__mocks__/new-item.mock";
import type { WsClient } from "@/packages/infrastructure/web-socket/ws-client";
import type { WsServer } from "@/packages/infrastructure/web-socket/ws-server";
import { NewItemWsController } from "@/contexts/trading/bidding/infrastructure/controllers/new-item.ws-controller";
import type { HttpServer } from "@/packages/infrastructure/http/http-server";
import type { Mock } from "bun:test";
import { SkinListedEvent } from "@/contexts/trading/bidding/application/events/skin-listed.event";
import { WsServerSocketIoAdapter } from "@/packages/external/web-socket/server/ws-server.socket-io-adapter";
import { HttpServerExpressAdapter } from "@/packages/external/http/server/http-server.express-adapter";
import { WsClientSocketIoAdapter } from "@/packages/external/web-socket/client/ws-client.socket-io-adapter";

const PORT = 8888;

let httpServer: HttpServer;
let wsServer: WsServer;
let wsClient: WsClient;
let eventBus: EventBus;
let publishSpy: Mock<EventBus["publish"]>;
beforeEach(async () => {
    httpServer = new HttpServerExpressAdapter();
    wsServer = new WsServerSocketIoAdapter((httpServer as HttpServerExpressAdapter).http);
    wsClient = new WsClientSocketIoAdapter(`ws://localhost:${PORT}`);
    eventBus = new EventBusInMemoryAsync();
    publishSpy = jest.spyOn(eventBus, "publish");
    new NewItemWsController(wsClient, eventBus);
    httpServer.listen(PORT);
    wsServer.on("connection", (socket) => {
        socket.emit("new_item", newItem);
    });
});

afterEach(async () => {
    await httpServer.close();
    wsClient.close();
});

describe("NewItemWsController", () => {
    it("Should receive a new item and publish ", (done) => {
        wsClient.on("new_item", () => {
            const [events] = publishSpy.mock.calls[0] as SkinListedEvent[][];
            expect(publishSpy).toHaveBeenCalled();
            expect(events.map((event) => event.payload)).toEqual(
                newItem.map((item) => ({
                    id: item.id,
                    name: item.market_name,
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
