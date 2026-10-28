import { BidIncrementer } from "@/contexts/trading/bidding/domain/auction/bid-incrementer";

describe("Bid Incrementer", () => {
    it("Should increment one percent on the next bid when auction has at least one bid and the price is bigger than 49 coincents", () =>
        expect(BidIncrementer.nextFor(3656)).toBe(3693));
    it("Should increment one coincent on the next bid when auction has at least one bid and the price is less than 50 coincents", () =>
        expect(BidIncrementer.nextFor(49)).toBe(50));
});
