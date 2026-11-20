import type { Mock } from "bun:test";
import type { AuctionGateway } from "@/contexts/trading/bidding/application/place-bid/auction.gateway";
import type { CsgoempireAuctionHttp } from "@/contexts/trading/bidding/infrastructure/http/csgoempire/csgoempire-auction.http";
import type { Logger } from "@/packages/application/logger";
import { testContainer } from "@/__builders__/test-container.builder";
import { LOGGER } from "@/packages/external/di/packages.identifiers";
import { SOCKET_METADATA } from "@/contexts/trading/shared/external/di/trading-shared.identifiers";
import { AUCTION_GATEWAY, CSGOEMPIRE_AUCTION_HTTP } from "@/contexts/trading/bidding/external/di/bidding.identifiers";
import { getSktMetafakeResponse } from "@/contexts/trading/shared/external/csgoempire/http/socket-metadata.http.fake-adapter";

const ACCOUNT_ID = 777;
const NEW_AUCTION_ID = 1;
const BID_VALUE = 300;
const COUNTER_BID_VALUE = 330;
const FIRST_BID = 1;
const SECOND_BID = 2;
const DRY_RUN_ENV = "development";
const SOCKET_METADATA_OF_ACCOUNT = {
    ...getSktMetafakeResponse,
    user: { ...getSktMetafakeResponse.user, id: ACCOUNT_ID },
};

let auctionHttp: CsgoempireAuctionHttp;
let placeBidSpy: Mock<CsgoempireAuctionHttp["placeBid"]>;
let getAuctionsSpy: Mock<CsgoempireAuctionHttp["getActiveAuctions"]>;
let realGateway: AuctionGateway;
let logger: Logger;
let loggerSpy: Mock<Logger["log"]>;
let dryRunGateway: AuctionGateway;

describe("AuctionGatewayDryRunAdapter", () => {
    beforeEach(async () => {
        const container = testContainer(DRY_RUN_ENV);
        container.rebind(SOCKET_METADATA).toConstantValue(SOCKET_METADATA_OF_ACCOUNT);
        auctionHttp = container.get(CSGOEMPIRE_AUCTION_HTTP);
        placeBidSpy = jest.spyOn(auctionHttp, "placeBid");
        getAuctionsSpy = jest.spyOn(auctionHttp, "getActiveAuctions");
        realGateway = testContainer().get(AUCTION_GATEWAY);
        logger = container.get(LOGGER);
        loggerSpy = jest.spyOn(logger, "log").mockImplementation(() => {});
        dryRunGateway = await container.getAsync(AUCTION_GATEWAY);
    });

    it("Should return the active auctions of the wrapped gateway", async () => {
        const expected = await realGateway.getActiveAuctions();

        const auctions = await dryRunGateway.getActiveAuctions();

        expect(auctions).toEqual(expected);
    });

    describe("placeBid", () => {
        it("Should never place the bid on the marketplace", async () => {
            await dryRunGateway.placeBid(NEW_AUCTION_ID, BID_VALUE);

            expect(placeBidSpy).not.toHaveBeenCalled();
        });

        it("Should never call the marketplace to place a bid", async () => {
            await dryRunGateway.placeBid(NEW_AUCTION_ID, BID_VALUE);

            expect(getAuctionsSpy).not.toHaveBeenCalled();
        });

        it("Should bid on an auction the account never bid on", async () => {
            const bidPlaced = await dryRunGateway.placeBid(NEW_AUCTION_ID, BID_VALUE);

            expect(bidPlaced).toMatchObject({
                id: NEW_AUCTION_ID,
                highestBid: BID_VALUE,
                bidderId: ACCOUNT_ID,
                numberOfBids: FIRST_BID,
            });
        });

        it("Should count the earlier dry-run bids on the same auction", async () => {
            await dryRunGateway.placeBid(NEW_AUCTION_ID, BID_VALUE);

            const bidPlaced = await dryRunGateway.placeBid(NEW_AUCTION_ID, COUNTER_BID_VALUE);

            expect(bidPlaced).toMatchObject({ highestBid: COUNTER_BID_VALUE, numberOfBids: SECOND_BID });
        });

        it("Should log the skipped bid", async () => {
            await dryRunGateway.placeBid(NEW_AUCTION_ID, BID_VALUE);

            expect(loggerSpy).toHaveBeenCalledWith(
                `Dry run: skipped a bid of ${BID_VALUE} on auction "${NEW_AUCTION_ID}"`,
            );
        });
    });
});
