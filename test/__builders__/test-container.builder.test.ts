import { testContainer } from "./test-container.builder";
import {
    AUCTION_GATEWAY,
    CSGOEMPIRE_AUCTION_HTTP,
    CSGOEMPIRE_TRADE_HTTP,
    WANTED_ITEM_REPOSITORY,
} from "@/contexts/trading/bidding/external/di/bidding.identifiers";
import { CSG_WS_CLIENT, SOCKET_METADATA_HTTP } from "@/contexts/trading/shared/external/di/trading-shared.identifiers";
import { CsgoempireAuctionHttpFakeAdapter } from "@/contexts/trading/bidding/external/http/csgoempire/csgoempire-auction.http.fake-adapter";
import { CsgoempireTradeHttpFakeAdapter } from "@/contexts/trading/bidding/external/http/csgoempire/csgoempire-trade.http.fake-adapter";
import { SocketMetadataHttpFakeAdapter } from "@/contexts/trading/shared/external/csgoempire/http/socket-metadata.http.fake-adapter";
import { CsgWsClientFakeAdapter } from "@/contexts/trading/shared/external/csgoempire/csg-ws-client.fake-adapter";
import { AuctionGatewayCsgoempireAdapter } from "@/contexts/trading/bidding/infrastructure/gateways/auction.gateway.csgoempire-adapter";
import { AuctionGatewayDryRunAdapter } from "@/contexts/trading/bidding/infrastructure/gateways/auction.gateway.dry-run-adapter";

describe("testContainer", () => {
    it("Should rebind the csgoempire apis to their fakes", async () => {
        const container = testContainer();

        const externals = [
            container.get(CSGOEMPIRE_AUCTION_HTTP),
            container.get(CSGOEMPIRE_TRADE_HTTP),
            container.get(SOCKET_METADATA_HTTP),
            await container.getAsync(CSG_WS_CLIENT),
        ];

        expect(externals).toEqual([
            expect.any(CsgoempireAuctionHttpFakeAdapter),
            expect.any(CsgoempireTradeHttpFakeAdapter),
            expect.any(SocketMetadataHttpFakeAdapter),
            expect.any(CsgWsClientFakeAdapter),
        ]);
    });

    it("Should wire the real auction gateway against the fakes by default", () => {
        const auctionGateway = testContainer().get(AUCTION_GATEWAY);

        expect(auctionGateway).toBeInstanceOf(AuctionGatewayCsgoempireAdapter);
    });

    it("Should wire the modules of the given environment", async () => {
        const auctionGateway = await testContainer("development").getAsync(AUCTION_GATEWAY);

        expect(auctionGateway).toBeInstanceOf(AuctionGatewayDryRunAdapter);
    });

    it("Should share one instance of each dependency inside a container", () => {
        const container = testContainer();

        const repository = container.get(WANTED_ITEM_REPOSITORY);

        expect(container.get(WANTED_ITEM_REPOSITORY)).toBe(repository);
    });

    it("Should build fresh instances on every call", () => {
        const repository = testContainer().get(WANTED_ITEM_REPOSITORY);

        const otherRepository = testContainer().get(WANTED_ITEM_REPOSITORY);

        expect(otherRepository).not.toBe(repository);
    });
});
