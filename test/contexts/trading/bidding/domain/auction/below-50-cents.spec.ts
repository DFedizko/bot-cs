import { Below50Cent } from "@/contexts/trading/bidding/domain/auction/below-50-cent";

const below50Cents = new Below50Cent();
test("Should verify amount below 50 cents", () => {
    expect(below50Cents.isSatisfiedBy(49)).toBe(true);
    expect(below50Cents.isSatisfiedBy(50)).toBe(false);
    expect(below50Cents.isSatisfiedBy(51)).toBe(false);
});
