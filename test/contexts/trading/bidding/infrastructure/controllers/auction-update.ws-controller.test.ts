import type { WsServer } from "@/packages/infrastructure/web-socket/ws-server";
import { auctionUpdate } from "./__mocks__/auction-update.mock";
import type { WsClient } from "@/packages/infrastructure/web-socket/ws-client";
import type { Mock } from "bun:test";
import { WsServerSocketIoAdapter } from "@/packages/external/web-socket/server/ws-server.socket-io-adapter";
import { HttpServerExpressAdapter } from "@/packages/external/http/server/http-server.express-adapter";
import { WsClientSocketIoAdapter } from "@/packages/external/web-socket/client/ws-client.socket-io-adapter";
import { AuctionUpdateWsController } from "@/contexts/trading/bidding/infrastructure/controllers/auction-update.ws-controller";
import type { CommandBus } from "@/packages/application/command-bus";
import { CommandBusInMemory } from "@/packages/infrastructure/command-bus/command-bus.in-memory";
import { TrackAuctionUpdateCommand } from "@/contexts/trading/bidding/application/track-auction-update/track-auction-update.command";

const PORT = 8888;

let httpServer: HttpServerExpressAdapter;
let wsServer: WsServer;
let wsClient: WsClient;
let commandBus: CommandBus;
let dispatchSpy: Mock<CommandBus["dispatch"]>;

describe("AuctionUpdateWsController", () => {
    beforeEach(() => {
        httpServer = new HttpServerExpressAdapter();
        wsServer = new WsServerSocketIoAdapter(httpServer.http);
        wsClient = new WsClientSocketIoAdapter(`ws://localhost:${PORT}`);
        commandBus = new CommandBusInMemory();
        commandBus.register({ handle: async () => {}, subscribedTo: () => TrackAuctionUpdateCommand.COMMAND_NAME });
        dispatchSpy = jest.spyOn(commandBus, "dispatch");
        new AuctionUpdateWsController(wsClient, commandBus);
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
            const commands = dispatchSpy.mock.calls as [TrackAuctionUpdateCommand][];
            expect(dispatchSpy).toHaveBeenCalledTimes(3);
            const commandPayloads = commands.flatMap(([command]) => ({
                id: command.id,
                bidderId: command.bidderId,
                value: command.value,
                endsAt: command.endsAt,
            }));
            expect(commandPayloads).toEqual(
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
