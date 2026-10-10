import { AtLeastOneBidSpecification } from "@/contexts/trading/bidding/domain/specifications/at-least-one-bid.specification";

const atLeastOneBid = new AtLeastOneBidSpecification();
test("Should verify at least one bid", () => {
    expect(atLeastOneBid.isSatisfiedBy(1)).toBe(true);
    expect(atLeastOneBid.isSatisfiedBy(0)).toBe(false);
});
