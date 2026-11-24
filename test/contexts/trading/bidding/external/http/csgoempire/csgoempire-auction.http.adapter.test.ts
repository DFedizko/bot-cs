import type { Container } from "inversify";
import { CSGOEMPIRE_HTTP_CLIENT } from "@/contexts/trading/shared/external/di/trading-shared.identifiers";
import { CSGOEMPIRE_AUCTION_HTTP } from "@/contexts/trading/bidding/external/di/bidding.identifiers";
import { biddingContainer } from "../../di/__builders__/bidding-container.builder";
import { placeBidRequest, placeBidSuccess } from "./__mocks__/place-bid.mock";
import { auctions } from "./__mocks__/auctions.mock";

let container: Container;

describe("CsgoempireAuctionHttpAdapter", () => {
    beforeEach(() => {
        container = biddingContainer("production");
    });

    it("Should post the bid value to the documented path of the deposit", async () => {
        const postSpy = jest.spyOn(container.get(CSGOEMPIRE_HTTP_CLIENT), "post").mockResolvedValue(placeBidSuccess);

        await container.get(CSGOEMPIRE_AUCTION_HTTP).placeBid(placeBidRequest);

        expect(postSpy).toHaveBeenCalledWith(`/trading/deposit/${placeBidRequest.deposit_id}/bid`, {
            body: { bid_value: placeBidRequest.bid_value },
        });
    });

    it("Should return the documented response of the placed bid", async () => {
        jest.spyOn(container.get(CSGOEMPIRE_HTTP_CLIENT), "post").mockResolvedValue(placeBidSuccess);

        const response = await container.get(CSGOEMPIRE_AUCTION_HTTP).placeBid(placeBidRequest);

        expect(response).toEqual(placeBidSuccess);
    });

    it("Should get the active auctions from the documented path", async () => {
        const getSpy = jest.spyOn(container.get(CSGOEMPIRE_HTTP_CLIENT), "get").mockResolvedValue(auctions);

        await container.get(CSGOEMPIRE_AUCTION_HTTP).getActiveAuctions();

        expect(getSpy).toHaveBeenCalledWith("/trading/user/auctions");
    });
});
