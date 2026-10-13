import { MaxAboveRecommendedPercentage } from "@/contexts/trading/bidding/domain/wanted-skin/criteria/max-above-recommended-percentage";
import { WantedSkin } from "@/contexts/trading/bidding/domain/wanted-skin/wanted-skin";
import { bidCandidate } from "./__builders__/bid-candidate.builder";

describe("Wanted Skin", () => {
    it("Should create a wanted skin", () => {
        const wantedSkin = WantedSkin.create({
            name: "AWP | Asiimov (Field-Tested)",
            criteria: [new MaxAboveRecommendedPercentage("-3")],
        });
        expect(wantedSkin.getName()).toBe("AWP | Asiimov (Field-Tested)");
        expect(wantedSkin.getCriteria()).toEqual(["MaxAboveRecommendedPercentage"]);
    });
    it("Should evaluate a bid and approve", () => {
        const candidate = bidCandidate({ value: 20000, aboveRecommendedPercentage: "-3.01" });
        const wantedSkin = WantedSkin.create({
            name: "AWP | Asiimov (Field-Tested)",
            criteria: [new MaxAboveRecommendedPercentage("-3")],
        });
        expect(wantedSkin.evaluate(candidate)).toMatchObject({ approved: true, failures: [] });
    });
    it("Should evaluate a bid and reject", () => {
        const candidate = bidCandidate({ value: 20000, aboveRecommendedPercentage: "-2.99" });
        const wantedSkin = WantedSkin.create({
            name: "AWP | Asiimov (Field-Tested)",
            criteria: [new MaxAboveRecommendedPercentage("-3")],
        });
        expect(wantedSkin.evaluate(candidate)).toMatchObject({
            approved: false,
            failures: ["MaxAboveRecommendedPercentage(-3%)"],
        });
    });
});
