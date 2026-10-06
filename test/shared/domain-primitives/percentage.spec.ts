import { DomainError } from "@/shared/error/domain-error";
import { Percentage } from "@/shared/domain-primitives/percentage";

describe("Percentage", () => {
    describe("Creations", () => {
        it("Should create a percentage from percent (positive and negative)", () => {
            const percentage = Percentage.fromPercent("50");
            const negative = Percentage.fromPercent("-50");

            expect(percentage.toFractionString()).toBe("0.5");
            expect(percentage.toPercentString()).toBe("50");
            expect(percentage.toString()).toBe("50%");

            expect(negative.toFractionString()).toBe("-0.5");
            expect(negative.toPercentString()).toBe("-50");
            expect(negative.toString()).toBe("-50%");
        });
        it("Should create a percentage object from fraction (positive and negative)", () => {
            const percentage = Percentage.fromFraction("0.5");
            const negative = Percentage.fromFraction("-0.5");

            expect(percentage.toFractionString()).toBe("0.5");
            expect(percentage.toPercentString()).toBe("50");
            expect(percentage.toString()).toBe("50%");

            expect(negative.toFractionString()).toBe("-0.5");
            expect(negative.toPercentString()).toBe("-50");
            expect(negative.toString()).toBe("-50%");
        });
        it("From percent and from fraction should be equivalent", () => {
            expect(Percentage.fromPercent("50")).toEqual(Percentage.fromFraction("0.50"));
            expect(Percentage.fromFraction("0.50")).toEqual(Percentage.fromPercent("50"));
        });
        it("Should support fractional and above -100 percentage", () => {
            expect(Percentage.fromPercent("12.5").toFractionString()).toBe("0.125");
            expect(Percentage.fromPercent("150").toFractionString()).toBe("1.5");
        });
        it("Should reject invalid input", () => {
            expect(() => Percentage.fromPercent("")).toThrow(DomainError);
            expect(() => Percentage.fromFraction("abc")).toThrow(DomainError);
        });
    });
    describe("Rounding", () => {
        describe("HALF_EVEN (in the event of a tie, it goes to the EVEN number)", () => {
            const tenPercent = Percentage.fromPercent("10");

            it("Should round down when below the half", () => {
                expect(tenPercent.of(14, "HALF_EVEN")).toBe(1); // 1.4 -> 1
            });
            it("Should round up when above the half", () => {
                expect(tenPercent.of(16, "HALF_EVEN")).toBe(2); // 1.6 -> 2
            });
            it("Should round to the even neighbour on a tie", () => {
                expect(tenPercent.of(15, "HALF_EVEN")).toBe(2); // 1.5 -> 2 (even)
                expect(tenPercent.of(25, "HALF_EVEN")).toBe(2); // 2.5 -> 2 (even)
            });
            it("Should apply to 50% ties correctly", () => {
                const fiftyPercent = Percentage.fromPercent("50");
                expect(fiftyPercent.of(85, "HALF_EVEN")).toBe(42); // 42.5 -> 42 (even)
                expect(fiftyPercent.of(87, "HALF_EVEN")).toBe(44); // 43.5 -> 44 (even)
            });
        });
        describe("HALF_AWAY_FROM_ZERO (in the event of a tie, move away from zero)", () => {
            const tenPercent = Percentage.fromPercent("10");

            it("Should round down when below the half", () => {
                expect(tenPercent.of(14, "HALF_AWAY_FROM_ZERO")).toBe(1); // 1.4 -> 1
            });
            it("Should round up when above the half", () => {
                expect(tenPercent.of(16, "HALF_AWAY_FROM_ZERO")).toBe(2); // 1.6 -> 2
            });
            it("Should always round away from zero on a tie", () => {
                expect(tenPercent.of(15, "HALF_AWAY_FROM_ZERO")).toBe(2); // 1.5 -> 2
                expect(tenPercent.of(25, "HALF_AWAY_FROM_ZERO")).toBe(3); // 2.5 -> 3
            });
            it("Should round away from zero for negatives too", () => {
                expect(tenPercent.of(-25, "HALF_AWAY_FROM_ZERO")).toBe(-3); // -2.5 -> -3
            });
        });
        it("The two modes should differ only on a tie", () => {
            const tenPercent = Percentage.fromPercent("10");
            expect(tenPercent.of(25, "HALF_EVEN")).toBe(2);
            expect(tenPercent.of(25, "HALF_AWAY_FROM_ZERO")).toBe(3);
        });
        it("Should default to HALF_EVEN when no mode is given", () => {
            expect(Percentage.fromFraction("0.10").of(25)).toBe(2); // tie -> even
        });
    });
    describe("Rounding regression (known values)", () => {
        it("HALF_EVEN markup should match reference values", () => {
            const fivePercent = Percentage.fromPercent("5");
            expect(10001 + fivePercent.of(10001, "HALF_EVEN")).toBe(10501);
            expect(33053 + fivePercent.of(33053, "HALF_EVEN")).toBe(34706);
        });
        it("HALF_AWAY_FROM_ZERO increment should match reference values", () => {
            const onePercent = Percentage.fromPercent("1");
            expect(50 + onePercent.of(50, "HALF_AWAY_FROM_ZERO")).toBe(51); // 50.5 -> 51
        });
    });
    describe("Verifications", () => {
        it("negate / isPositive / isNegative / isZero", () => {
            expect(Percentage.fromPercent("50").negate().toPercentString()).toBe("-50");
            expect(Percentage.fromPercent("-1").isNegative()).toBe(true);
            expect(Percentage.fromPercent("1").isPositive()).toBe(true);
            expect(Percentage.fromPercent("0").isZero()).toBe(true);
        });
        it("Should verify equality", () => {
            expect(Percentage.fromPercent("50").equals(Percentage.fromPercent("50"))).toBe(true);
            expect(Percentage.fromPercent("50").equals(Percentage.fromFraction("0.50"))).toBe(true);
            expect(Percentage.fromFraction("0.5").equals(Percentage.fromFraction("0.50"))).toBe(true);
            expect(Percentage.fromPercent("50").equals(Percentage.fromPercent("25"))).toBe(false);
            expect(Percentage.fromPercent("50").equals(Percentage.fromPercent("-50"))).toBe(false);
        });
    });
    describe("Precision (no float)", () => {
        it("Should stay exact where float would drift", () => {
            expect(Percentage.fromFraction("0.333333").of(1_000_000)).toBe(333333);
        });
    });
});
