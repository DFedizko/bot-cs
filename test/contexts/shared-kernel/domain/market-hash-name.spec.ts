import { MarketHashName } from "@/contexts/shared-kernel/domain/market-hash-name";
import { DomainError } from "@/packages/error/domain-error";
import { EmptyStringError } from "@/packages/error/empty-string.error";

const LONGEST_KNOWN_NAME = "Souvenir Charm | Budapest 2025 Highlight | KSCERATO vs Natus Vincere on Inferno";
const SHORTEST_NAME = "A";

const nameOfLength = (length: number) => "A".repeat(length);

describe("MarketHashName", () => {
    it("Should keep the Steam market hash name of an item", () => {
        const name = new MarketHashName("AWP | Asiimov (Field-Tested)");

        expect(name.getValue()).toBe("AWP | Asiimov (Field-Tested)");
    });

    it("Should trim the name", () => {
        const name = new MarketHashName("  AWP | Asiimov (Field-Tested) ");

        expect(name.getValue()).toBe("AWP | Asiimov (Field-Tested)");
    });

    it("Should accept a name of a single character", () => {
        const name = new MarketHashName(SHORTEST_NAME);

        expect(name.getValue()).toBe(SHORTEST_NAME);
    });

    it("Should accept the longest market hash name CS2 has", () => {
        const name = new MarketHashName(LONGEST_KNOWN_NAME);

        expect(name.getValue()).toBe(LONGEST_KNOWN_NAME);
    });

    it("Should accept a name of the max length", () => {
        const name = new MarketHashName(nameOfLength(MarketHashName.MAX_LENGTH));

        expect(name.getValue()).toHaveLength(MarketHashName.MAX_LENGTH);
    });

    it("Should leave a margin over the longest market hash name CS2 has", () => {
        expect(MarketHashName.MAX_LENGTH).toBeGreaterThan(LONGEST_KNOWN_NAME.length);
    });

    it("Should reject a blank name", () => {
        expect(() => new MarketHashName("   ")).toThrow(EmptyStringError);
    });

    it("Should reject a name longer than the max length", () => {
        const tooLong = nameOfLength(MarketHashName.MAX_LENGTH + 1);

        expect(() => new MarketHashName(tooLong)).toThrow(DomainError);
    });

    it("Should say the max length when the name is too long", () => {
        const tooLong = nameOfLength(MarketHashName.MAX_LENGTH + 1);

        expect(() => new MarketHashName(tooLong)).toThrow(
            `The market hash name "${tooLong}" must have at most ${MarketHashName.MAX_LENGTH} characters`,
        );
    });

    it("Should equal another name with the same value", () => {
        const name = new MarketHashName("AWP | Asiimov (Field-Tested)");

        expect(name.equals(new MarketHashName(" AWP | Asiimov (Field-Tested)"))).toBe(true);
    });
});
