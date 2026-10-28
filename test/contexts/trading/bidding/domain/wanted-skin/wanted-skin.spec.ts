import { MaxAboveRecommendedPercentage } from "@/contexts/trading/bidding/domain/wanted-item/criteria/max-above-recommended-percentage";
import { WantedItem } from "@/contexts/trading/bidding/domain/wanted-item/wanted-item";

describe("Wanted Skin", () => {
    it("Should create a wanted skin", () => {
        const wantedItem = WantedItem.create({
            name: "AWP | Asiimov (Field-Tested)",
            criteria: [new MaxAboveRecommendedPercentage("-3")],
        });
        expect(wantedItem.getName()).toBe("AWP | Asiimov (Field-Tested)");
        expect(wantedItem.getCriteria()).toEqual(["MaxAboveRecommendedPercentage"]);
    });
    it("Should evaluate a bid and approve", () => {
        const wantedItem = WantedItem.create({
            name: "AWP | Asiimov (Field-Tested)",
            criteria: [new MaxAboveRecommendedPercentage("-3")],
        });
        expect(wantedItem.evaluate({ value: 20000, aboveRecommendedPercentage: "-3.01" })).toMatchObject({
            approved: true,
            failures: [],
        });
    });
    it("Should evaluate a bid and reject", () => {
        const wantedItem = WantedItem.create({
            name: "AWP | Asiimov (Field-Tested)",
            criteria: [new MaxAboveRecommendedPercentage("-3")],
        });
        expect(wantedItem.evaluate({ value: 20000, aboveRecommendedPercentage: "-2.99" })).toMatchObject({
            approved: false,
            failures: ["MaxAboveRecommendedPercentage(-3%)"],
        });
    });
});
