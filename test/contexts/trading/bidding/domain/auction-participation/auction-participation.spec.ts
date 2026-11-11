import { AuctionParticipation } from "@/contexts/trading/bidding/domain/auction-participation/auction-participation";

describe("AuctionParticipatoin", () => {
    it("Should create a auction participation", () => {
        const auctionParticipation = AuctionParticipation.create({ auctionId: 1, accountId: 1, maxBid: 10100 });
        expect(auctionParticipation.getId()).toBe(1);
        expect(auctionParticipation.getAccountId()).toBe(1);
        expect(auctionParticipation.getMaxBid()).toBe(10100);
    });
});
