import { BidIncrementer } from "@/contexts/trading/bidding/domain/services/bid-incrementer";

describe("Bid Incrementer", () => {
    it("Should increment one percent on the next bid when auction has at least one bid and the price is bigger than 49 coincents", () =>
        expect(BidIncrementer.nextFor({ amount: 3656, numberOfBids: 1 })).toBe(3693));
    it("Should increment one coincent on the next bid when auction has at least one bid and the price is less than 50 coincents", () =>
        expect(BidIncrementer.nextFor({ amount: 49, numberOfBids: 1 })).toBe(50));
    it("Should use the bid amount in the next bid if the number of bids is zero", () =>
        expect(BidIncrementer.nextFor({ amount: 21000, numberOfBids: 0 })).toBe(21000));
});
