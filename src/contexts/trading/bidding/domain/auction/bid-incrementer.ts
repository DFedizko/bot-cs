import { COIN } from "@/contexts/shared-kernel/domain/currencies";
import { Money } from "@/packages/domain-primitives/money";
import { Percentage } from "@/packages/domain-primitives/percentage";
import { Below50Cent } from "./below-50-cent";

const below50Cent = new Below50Cent();

export class BidIncrementer {
    private static CURRENCY = COIN;

    static nextFor(value: number): number {
        const ONE_UNIT = 1;
        const amountInCents = Money.fromCents({ amount: value, currency: BidIncrementer.CURRENCY });
        const onePercentOfAmount = amountInCents.percentageOf(Percentage.fromPercent("1"), "HALF_AWAY_FROM_ZERO");
        if (below50Cent.isSatisfiedBy(value)) {
            const oneCent = Money.fromCents({ amount: ONE_UNIT, currency: BidIncrementer.CURRENCY });
            return amountInCents.add(oneCent).getAmount();
        }
        return amountInCents.add(onePercentOfAmount).getAmount();
    }
}
