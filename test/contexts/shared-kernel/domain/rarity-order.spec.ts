import { Rarity } from "@/contexts/shared-kernel/domain/rarity";
import { RARITY_ORDER } from "@/contexts/shared-kernel/domain/rarity-order";

describe("RARITY_ORDER", () => {
    it("Should order every rarity from Consumer Grade, the lowest, to Contraband, the highest", () => {
        const order = [...RARITY_ORDER];

        expect(order).toEqual([
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

    it("Should hold each rarity once", () => {
        const distinct = new Set(RARITY_ORDER);

        expect([...distinct].toSorted()).toEqual(Object.values(Rarity).toSorted());
    });

    it("Should sort rarities from the lowest to the highest by their index in it", () => {
        const shuffled = [Rarity.CONTRABAND, Rarity.CONSUMER_GRADE, Rarity.COVERT, Rarity.MIL_SPEC_GRADE];

        const sorted = shuffled.toSorted((first, second) => RARITY_ORDER.indexOf(first) - RARITY_ORDER.indexOf(second));

        expect(sorted).toEqual([Rarity.CONSUMER_GRADE, Rarity.MIL_SPEC_GRADE, Rarity.COVERT, Rarity.CONTRABAND]);
    });
});
