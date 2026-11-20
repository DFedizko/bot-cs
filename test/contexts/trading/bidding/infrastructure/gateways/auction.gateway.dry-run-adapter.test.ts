import type { Mock } from "bun:test";
import type { AuctionGateway } from "@/contexts/trading/bidding/application/place-bid/auction.gateway";
import { AuctionGatewayCsgoempireAdapter } from "@/contexts/trading/bidding/infrastructure/gateways/auction.gateway.csgoempire-adapter";
import { AuctionGatewayDryRunAdapter } from "@/contexts/trading/bidding/infrastructure/gateways/auction.gateway.dry-run-adapter";
import type { CsgoempireAuctionHttp } from "@/contexts/trading/bidding/infrastructure/http/csgoempire/csgoempire-auction.http";
import type { Logger } from "@/packages/application/logger";
import { LoggerConsoleAdapter } from "@/packages/infrastructure/logger/logger.console-adapter";
import { CsgoempireAuctionHttpFakeAdapter } from "../../external/http/csgoempire/csgoempire-auction.http.fake-adapter";

const ACCOUNT_ID = 777;
const NEW_AUCTION_ID = 1;
const BID_VALUE = 300;
const COUNTER_BID_VALUE = 330;
const FIRST_BID = 1;
const SECOND_BID = 2;

let auctionHttp: CsgoempireAuctionHttp;
let placeBidSpy: Mock<CsgoempireAuctionHttp["placeBid"]>;
let getAuctionsSpy: Mock<CsgoempireAuctionHttp["getActiveAuctions"]>;
let realGateway: AuctionGateway;
let logger: Logger;
let loggerSpy: Mock<Logger["log"]>;
let dryRunGateway: AuctionGateway;

describe("AuctionGatewayDryRunAdapter", () => {
    beforeEach(() => {
        auctionHttp = new CsgoempireAuctionHttpFakeAdapter();
        placeBidSpy = jest.spyOn(auctionHttp, "placeBid");
        getAuctionsSpy = jest.spyOn(auctionHttp, "getActiveAuctions");
        realGateway = new AuctionGatewayCsgoempireAdapter(auctionHttp);
        logger = new LoggerConsoleAdapter();
        loggerSpy = jest.spyOn(logger, "log").mockImplementation(() => {});
        dryRunGateway = new AuctionGatewayDryRunAdapter(realGateway, logger, ACCOUNT_ID);
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
