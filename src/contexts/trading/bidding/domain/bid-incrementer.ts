import { Percentage } from "@/packages/domain-primitives/percentage";
import { Below50Cent } from "./below-50-cent";
import { CoinCent } from "@/contexts/trading/shared/domain/coin-cent";

const below50Cent = new Below50Cent();

export class BidIncrementer {
    static nextFor(value: number): number {
        const ONE_UNIT = 1;
        const valueInCents = CoinCent(value);
        const onePercentOfValue = valueInCents.percentageOf(Percentage.fromPercent("1"), "HALF_AWAY_FROM_ZERO");
        if (below50Cent.isSatisfiedBy(value)) {
            const oneCent = CoinCent(ONE_UNIT);
            return valueInCents.add(oneCent).getAmount();
        }
        return valueInCents.add(onePercentOfValue).getAmount();
    }
}
