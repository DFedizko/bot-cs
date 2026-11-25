import { Rarity } from "@/contexts/shared-kernel/domain/rarity";

const OFFICIAL_NAMES = [
    "Consumer Grade",
    "Industrial Grade",
    "Mil-Spec Grade",
    "Restricted",
    "Classified",
    "Covert",
    "Extraordinary",
    "Contraband",
];

describe("Rarity", () => {
    it("Should name every item rarity as CS2 displays it, from the lowest to the highest", () => {
        const names: string[] = Object.values(Rarity);

        expect(names).toEqual(OFFICIAL_NAMES);
    });
});
