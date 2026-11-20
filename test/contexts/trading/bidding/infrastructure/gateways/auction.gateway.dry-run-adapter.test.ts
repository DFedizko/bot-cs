import type { Mock } from "bun:test";
import type { AuctionGateway } from "@/contexts/trading/bidding/application/place-bid/auction.gateway";
import { AuctionGatewayCsgoempireAdapter } from "@/contexts/trading/bidding/infrastructure/gateways/auction.gateway.csgoempire-adapter";
import { AuctionGatewayDryRunAdapter } from "@/contexts/trading/bidding/infrastructure/gateways/auction.gateway.dry-run-adapter";
import type { CsgoempireAuctionHttp } from "@/contexts/trading/bidding/infrastructure/http/csgoempire/csgoempire-auction.http";
import type { Logger } from "@/packages/application/logger";
import { NotFoundError } from "@/packages/infrastructure/http/errors/not-found.error";
import { LoggerConsoleAdapter } from "@/packages/infrastructure/logger/logger.console-adapter";
import { CsgoempireAuctionHttpFakeAdapter } from "../../external/http/csgoempire/csgoempire-auction.http.fake-adapter";

const ACCOUNT_ID = 777;
const AUCTION_ID = 11204;
const BID_VALUE = 300;
const UNKNOWN_AUCTION_ID = 1;

let auctionHttp: CsgoempireAuctionHttp;
let placeBidSpy: Mock<CsgoempireAuctionHttp["placeBid"]>;
let realGateway: AuctionGateway;
let logger: Logger;
let loggerSpy: Mock<Logger["log"]>;
let dryRunGateway: AuctionGateway;

describe("AuctionGatewayDryRunAdapter", () => {
    beforeEach(() => {
        auctionHttp = new CsgoempireAuctionHttpFakeAdapter();
        placeBidSpy = jest.spyOn(auctionHttp, "placeBid");
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
            await dryRunGateway.placeBid(AUCTION_ID, BID_VALUE);

            expect(placeBidSpy).not.toHaveBeenCalled();
        });

        it("Should return the auction as if the account had placed the bid", async () => {
            const [auction] = await realGateway.getActiveAuctions();

            const bidPlaced = await dryRunGateway.placeBid(AUCTION_ID, BID_VALUE);

            expect(bidPlaced).toEqual({
                ...auction!,
                highestBid: BID_VALUE,
                bidderId: ACCOUNT_ID,
                numberOfBids: auction!.numberOfBids + 1,
            });
        });

        it("Should log the skipped bid", async () => {
            await dryRunGateway.placeBid(AUCTION_ID, BID_VALUE);

            expect(loggerSpy).toHaveBeenCalledWith(`Dry run: skipped a bid of ${BID_VALUE} on auction "${AUCTION_ID}"`);
        });

        it("Should throw a not found error for an unknown auction", async () => {
            const placing = dryRunGateway.placeBid(UNKNOWN_AUCTION_ID, BID_VALUE);

            await expect(placing).rejects.toThrow(NotFoundError);
        });
    });
});
