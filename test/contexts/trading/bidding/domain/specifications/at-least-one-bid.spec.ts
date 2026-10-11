import { AtLeastOneBid } from "@/contexts/trading/bidding/domain/specifications/at-least-one-bid";

const atLeastOneBid = new AtLeastOneBid();
test("Should verify at least one bid", () => {
    expect(atLeastOneBid.isSatisfiedBy(1)).toBe(true);
    expect(atLeastOneBid.isSatisfiedBy(0)).toBe(false);
});
