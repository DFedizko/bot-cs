import type { Container } from "inversify";
import type { WsServer } from "@/packages/infrastructure/web-socket/ws-server";
import { auctionUpdate } from "./__mocks__/auction-update.mock";
import { WsServerSocketIoAdapter } from "@/packages/external/web-socket/server/ws-server.socket-io-adapter";
import { HttpServerExpressAdapter } from "@/packages/external/http/server/http-server.express-adapter";
import { TrackAuctionUpdateCommand } from "@/contexts/trading/bidding/application/track-auction-update/track-auction-update.command";
import { CsgWsClientFakeAdapter } from "@/contexts/trading/shared/external/csgoempire/csg-ws-client.fake-adapter";
import { testContainer } from "@/__builders__/test-container.builder";
import { COMMAND_BUS, LOGGER } from "@/packages/external/di/packages.identifiers";
import { CSG_WS_CLIENT } from "@/contexts/trading/shared/external/di/trading-shared.identifiers";
import { AUCTION_UPDATE_CONTROLLER } from "@/contexts/trading/bidding/external/di/bidding.identifiers";

const PORT = 8888;
const FAILURE = "bid rejected";
const [FAILING_AUCTION] = auctionUpdate;

let container: Container;
let httpServer: HttpServerExpressAdapter;
let wsServer: WsServer;

describe("AuctionUpdateWsController", () => {
    beforeEach(() => {
        container = testContainer();
        httpServer = new HttpServerExpressAdapter();
        wsServer = new WsServerSocketIoAdapter(httpServer.http);
        container.rebind(CSG_WS_CLIENT).toConstantValue(new CsgWsClientFakeAdapter(`ws://localhost:${PORT}`));
        httpServer.listen(PORT);
        wsServer.on("connection", (socket) => {
            socket.emit("auction_update", auctionUpdate);
        });
    });

    afterEach(async () => {
        container.get(CSG_WS_CLIENT).close();
        await httpServer.close();
    });

    it("Should receive a auction update socket and publish outbid event", (done) => {
        const dispatchSpy = jest.spyOn(container.get(COMMAND_BUS), "dispatch").mockResolvedValue();
        container.get(AUCTION_UPDATE_CONTROLLER);

        container.get(CSG_WS_CLIENT).on("auction_update", () => {
            const commands = dispatchSpy.mock.calls as [TrackAuctionUpdateCommand][];
            expect(dispatchSpy).toHaveBeenCalledTimes(3);
            const commandPayloads = commands.flatMap(([command]) => ({
                auctionId: command.auctionId,
                bidderId: command.bidderId,
                value: command.value,
                endsAt: command.endsAt,
            }));
            expect(commandPayloads).toEqual(
                auctionUpdate.map((auction) => ({
                    auctionId: auction.id,
                    bidderId: auction.auction_highest_bidder,
                    value: auction.auction_highest_bid,
                    endsAt: auction.auction_ends_at,
                })),
            );
            done();
        });
    });

    it("Should log an auction update whose tracking failed and still track the others", async () => {
        const csgWsClient = container.get(CSG_WS_CLIENT);
        const dispatchSpy = jest
            .spyOn(container.get(COMMAND_BUS), "dispatch")
            .mockRejectedValueOnce(new Error(FAILURE))
            .mockResolvedValue();
        const logged = new Promise<string>((resolve) =>
            jest.spyOn(container.get(LOGGER), "log").mockImplementation(resolve),
        );

        container.get(AUCTION_UPDATE_CONTROLLER);

        expect(await logged).toBe(
            `Command "${TrackAuctionUpdateCommand.COMMAND_NAME}" failed (auctionId=${FAILING_AUCTION!.id}, accountId=${csgWsClient.accountId}): ${FAILURE}`,
        );
        expect(dispatchSpy).toHaveBeenCalledTimes(auctionUpdate.length);
    });
});
