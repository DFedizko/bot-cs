import { Rarity } from "@/contexts/shared-kernel/domain/rarity";
import { RARITY_ORDER } from "@/contexts/shared-kernel/domain/rarity-order";

describe("RARITY_ORDER", () => {
    it("Should rank every rarity from the lowest to the highest", () => {
        expect(RARITY_ORDER).toEqual([
            Rarity.CONSUMER_GRADE,
            Rarity.INDUSTRIAL_GRADE,
            Rarity.MIL_SPEC_GRADE,
            Rarity.RESTRICTED,
            Rarity.CLASSIFIED,
            Rarity.COVERT,
            Rarity.EXTRAORDINARY,
            Rarity.CONTRABAND,
        ]);
    });

    it("Should rank each rarity once", () => {
        expect(new Set(RARITY_ORDER).size).toBe(Object.values(Rarity).length);
    });
});
