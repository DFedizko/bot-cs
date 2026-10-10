import { Below50CentSpecification } from "@/contexts/trading/bidding/domain/specifications/below-50-cent.specification";

const below50Cents = new Below50CentSpecification();
test("Should verify amount below 50 cents", () => {
    expect(below50Cents.isSatisfiedBy(49)).toBe(true);
    expect(below50Cents.isSatisfiedBy(50)).toBe(false);
    expect(below50Cents.isSatisfiedBy(51)).toBe(false);
});
