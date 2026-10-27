import type { WsServer } from "@/packages/infrastructure/web-socket/ws-server";
import { auctionUpdate } from "./__mocks__/auction-update.mock";
import type { WsClient } from "@/packages/infrastructure/web-socket/ws-client";
import type { EventBus } from "@/packages/application/event-bus";
import type { Mock } from "bun:test";
import { WsServerSocketIoAdapter } from "@/packages/external/web-socket/server/ws-server.socket-io-adapter";
import { HttpServerExpressAdapter } from "@/packages/external/http/server/http-server.express-adapter";
import { WsClientSocketIoAdapter } from "@/packages/external/web-socket/client/ws-client.socket-io-adapter";
import { EventBusInMemoryAsync } from "@/packages/external/event-bus/event-bus.in-memory-async";
import { OutbidEvent } from "@/contexts/trading/bidding/application/events/outbid.event";
import { OnAuctionUpdateWsController } from "@/contexts/trading/bidding/infrastructure/controllers/on-auction-update.ws-controller";

const PORT = 8888;

let httpServer: HttpServerExpressAdapter;
let wsServer: WsServer;
let wsClient: WsClient;
let eventBus: EventBus;
let publishSpy: Mock<EventBus["publish"]>;

describe("OnAuctionUpdateWsController", () => {
    beforeEach(() => {
        httpServer = new HttpServerExpressAdapter();
        wsServer = new WsServerSocketIoAdapter(httpServer.http);
        wsClient = new WsClientSocketIoAdapter(`ws://localhost:${PORT}`);
        eventBus = new EventBusInMemoryAsync();
        publishSpy = jest.spyOn(eventBus, "publish");
        new OnAuctionUpdateWsController(wsClient, eventBus);
        httpServer.listen(PORT);
        wsServer.on("connection", (socket) => {
            socket.emit("auction_update", auctionUpdate);
        });
    });

    afterEach(async () => {
        await httpServer.close();
        wsClient.close();
    });

    it("Should receive a auction update socket and publish outbid event", (done) => {
        wsClient.on("auction_update", () => {
            const [events] = publishSpy.mock.calls[0] as OutbidEvent[][];
            expect(publishSpy).toHaveBeenCalled();
            expect(events.map((event) => event.payload)).toEqual(
                auctionUpdate.map((auction) => ({
                    id: auction.id,
                    bidderId: auction.auction_highest_bidder,
                    value: auction.auction_highest_bid,
                    endsAt: auction.auction_ends_at,
                })),
            );
            done();
        });
    });
});
