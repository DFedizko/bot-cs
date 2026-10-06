import { Currency } from "@/shared/domain-primitives/currency";
import { DomainError } from "@/shared/error/domain-error";
import { Money } from "@/shared/domain-primitives/money";
import { Percentage } from "@/shared/domain-primitives/percentage";
import { BRL, USD } from "@/shared-kernel/domain/currencies";

describe("Money", () => {
    describe("Creations", () => {
        it("Should create a Money object from cents in number and in bigint", () => {
            const money = Money.fromCents({ amount: 150, currency: USD });
            expect(money.getAmount()).toBe(150);
            expect(money.getCurrency().getCode()).toBe("USD");
        });
        it("Should create a Money object from decimal", () => {
            const money = Money.fromDecimal({
                amount: "1.55",
                currency: USD,
            });

            expect(money.getCurrency().getCode()).toBe("USD");
            expect(money.getAmount()).toBe(155);
        });
        it("Should create a Money object from negative cents", () => {
            const money = Money.fromCents({ amount: -150, currency: USD });

            expect(money.getCurrency().getCode()).toBe("USD");
            expect(money.getAmount()).toBe(-150);
        });
        it("Should create a Money object from negative decimal", () => {
            const money = Money.fromDecimal({
                amount: "-1.55",
                currency: USD,
            });

            expect(money.getCurrency().getCode()).toBe("USD");
            expect(money.getAmount()).toBe(-155);
        });
        it("Should pad missing decimals", () => {
            expect(Money.fromDecimal({ amount: "10.5", currency: BRL }).getAmount()).toBe(1050);
            expect(Money.fromDecimal({ amount: "10", currency: BRL }).getAmount()).toBe(1000);
        });
        it("Should truncate extra decimals", () => {
            expect(Money.fromDecimal({ amount: "10.509", currency: BRL }).getAmount()).toBe(1050);
        });
        describe("Errors", () => {
            it("Should throw an error when create a Money object with a invalid amount", () => {
                expect(() => Money.fromDecimal({ amount: "abc", currency: BRL })).toThrow(DomainError);
            });
            it("Should throw an error when create a Money object with a non-integer number", () => {
                expect(() => Money.fromCents({ amount: 10.5, currency: BRL })).toThrow(DomainError);
            });
        });
    });
    describe("Accessors", () => {
        it("Should getAmount / getCurrency expose the canonical state", () => {
            const money = Money.fromCents({ amount: 1990, currency: USD });
            expect(money.getAmount()).toBe(1990);
            expect(money.getCurrency().getCode()).toBe("USD");
        });
        it("Should get money in cents", () => {
            expect(Money.fromDecimal({ amount: "1.50", currency: USD }).toCents()).toBe(150);
        });
        it("Should get money in decimal string", () => {
            expect(
                Money.fromCents({
                    amount: 5,
                    currency: USD,
                }).toDecimalString(),
            ).toBe("0.05");
            expect(
                Money.fromCents({
                    amount: 150,
                    currency: USD,
                }).toDecimalString(),
            ).toBe("1.50");
            expect(
                Money.fromCents({
                    amount: -150,
                    currency: USD,
                }).toDecimalString(),
            ).toBe("-1.50");
        });
        it("Should get money amount and currency in string", () => {
            expect(
                Money.fromCents({
                    amount: 150,
                    currency: USD,
                }).toString(),
            ).toBe("USD 1.50");
        });
        it("Should format money in localized currency string", () => {
            const money = Money.fromDecimal({
                amount: "1.00",
                currency: USD,
            });
            const formatted = money.format().replace(/ /g, " ");
            expect(money.format()).toBe("$1.00");
            expect(formatted).toContain("1.00");
            expect(formatted).toContain("$");
        });
    });
    describe("Operations", () => {
        it("Must add up to a certain amount", () => {
            const money = Money.fromDecimal({ amount: "100.00", currency: USD });
            const moneyToSum = Money.fromCents({ amount: 10000, currency: USD });
            const negativeMoney = Money.fromCents({
                amount: -2000,
                currency: USD,
            });
            const negativeMoneyToSum = Money.fromCents({
                amount: -2000,
                currency: USD,
            });

            const moneyCombined = money.add(moneyToSum).getAmount();
            const negativeMoneyCombined = negativeMoney.add(negativeMoneyToSum).getAmount();

            expect(moneyCombined).toBe(20000);
            expect(negativeMoneyCombined).toBe(-4000);
        });
        it("Must subtract a specific amount", () => {
            const money = Money.fromCents({ amount: 2000, currency: USD });
            const moneyToSubstract = Money.fromDecimal({
                amount: "20",
                currency: USD,
            });
            const negativeMoney = Money.fromDecimal({
                amount: "-20.53",
                currency: USD,
            });
            const negativeMoneyToSubstract = Money.fromCents({
                amount: -2053,
                currency: USD,
            });

            const stolenMoney = money.substract(moneyToSubstract).getAmount();
            const negativeMoneyCombined = negativeMoney.substract(negativeMoneyToSubstract).getAmount();

            expect(stolenMoney).toBe(0);
            expect(negativeMoneyCombined).toBe(0);
        });
        it("Should not operate across different currencies", () => {
            const brl = Money.fromCents({ amount: 100, currency: BRL });
            const usd = Money.fromCents({ amount: 100, currency: USD });
            expect(() => brl.add(usd)).toThrow(DomainError);
            expect(() => brl.substract(usd)).toThrow(DomainError);
        });
        it("Should multiply scales by an integer factor", () => {
            const money = Money.fromCents({ amount: 1990, currency: USD });
            expect(money.multiply(3).getAmount()).toBe(5970);
        });
        it("Shuld throw an error when multiply non-integer factor", () => {
            const money = Money.fromCents({ amount: 1990, currency: BRL });
            expect(() => money.multiply(1.5)).toThrow(DomainError);
        });
        it("Should operations return a new instance (immutability)", () => {
            const money = Money.fromCents({ amount: 1000, currency: BRL });
            const result = money.add(Money.fromCents({ amount: 1000, currency: BRL }));
            expect(money.getAmount()).toBe(1000);
            expect(result).not.toBe(money);
        });
    });
    describe("Verifications", () => {
        it("Should verify a negative number", () => {
            const money = Money.fromDecimal({ amount: "-1.50", currency: USD });
            expect(money.isNegative()).toBe(true);
            expect(money.isPositive()).toBe(false);
        });
        it("Should verify a positive number", () => {
            const money = Money.fromDecimal({ amount: "1.50", currency: USD });
            expect(money.isPositive()).toBe(true);
            expect(money.isNegative()).toBe(false);
        });
        it("Should verify is zero", () => {
            const money = Money.fromDecimal({ amount: "0", currency: USD });
            expect(money.isZero()).toBe(true);
        });
    });
    describe("Percentages", () => {
        it("Should money increase with a positive percentage", () => {
            const money = Money.fromCents({ amount: 10000, currency: BRL });
            const result = money.applyPercentage(Percentage.fromPercent("50"));
            expect(result.getAmount()).toBe(15000);
        });
        it("Should money discount with a negative percentage", () => {
            const money = Money.fromCents({ amount: 10000, currency: BRL });
            const result = money.applyPercentage(Percentage.fromPercent("-50"));
            expect(result.getAmount()).toBe(5000);
        });
        it("Should percentage honours the rounding mode", () => {
            const money = Money.fromCents({ amount: 50, currency: BRL });
            expect(money.applyPercentage(Percentage.fromPercent("1"), "HALF_AWAY_FROM_ZERO").getAmount()).toBe(51);
            expect(money.applyPercentage(Percentage.fromPercent("1"), "HALF_EVEN").getAmount()).toBe(50);
        });
        it("Should return the money portion of percentage", () => {
            const money = Money.fromCents({ amount: 10000, currency: BRL });
            expect(money.percentageOf(Percentage.fromPercent("50")).getAmount()).toBe(5000);
        });
    });
    describe("Comparisons", () => {
        it("Should comparte equality", () => {
            const moneyA = Money.fromCents({ amount: 100, currency: USD });
            const moneyB = Money.fromDecimal({ amount: "1.00", currency: USD });
            const moneyC = Money.fromDecimal({ amount: "1.00", currency: BRL });
            expect(moneyA.equals(moneyB)).toBe(true);
            expect(moneyA.equals(moneyC)).toBe(false);
        });
        it("compareTo / isGreaterThan / isLessThan", () => {
            const small = Money.fromCents({ amount: 500, currency: USD });
            const big = Money.fromCents({ amount: 1000, currency: USD });
            expect(small.comparteTo(big)).toBe(-1);
            expect(big.comparteTo(small)).toBe(1);
            expect(big.comparteTo(Money.fromCents({ amount: 1000, currency: USD }))).toBe(0);
            expect(big.isGreaterThan(small)).toBe(true);
            expect(small.isLessThan(big)).toBe(true);
        });
        it("isZero / isPositive / isNegative", () => {
            expect(Money.fromDecimal({ amount: "0", currency: USD }).isZero()).toBe(true);
            expect(Money.fromDecimal({ amount: "1", currency: USD }).isPositive()).toBe(true);
            expect(Money.fromDecimal({ amount: "-1", currency: USD }).isNegative()).toBe(true);
        });
        it("Should not compare different currencies", () => {
            const brl = Money.fromCents({ amount: 100, currency: BRL });
            const usd = Money.fromCents({ amount: 100, currency: USD });
            expect(() => brl.comparteTo(usd)).toThrow(DomainError);
        });
    });
});
