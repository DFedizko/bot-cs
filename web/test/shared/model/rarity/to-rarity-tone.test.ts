import { describe, expect, it } from "bun:test";
import type { Rarity } from "@/shared/model/rarity/rarity";
import type { RarityTone } from "@/shared/model/rarity/rarity-tone";
import { toRarityTone } from "@/shared/model/rarity/to-rarity-tone";

const TONE_BY_RARITY: ReadonlyArray<[Rarity, RarityTone]> = [
    ["Consumer Grade", "consumer"],
    ["Industrial Grade", "industrial"],
    ["Mil-Spec Grade", "milspec"],
    ["Restricted", "restricted"],
    ["Classified", "classified"],
    ["Covert", "covert"],
    ["Contraband", "contraband"],
];

describe("toRarityTone", () => {
    it.each(TONE_BY_RARITY)("Should tint %s with the %s token", (rarity, tone) => {
        expect(toRarityTone(rarity)).toBe(tone);
    });

    it("Should tint Extraordinary with the covert colour, as the game does", () => {
        expect(toRarityTone("Extraordinary")).toBe("covert");
    });
});
