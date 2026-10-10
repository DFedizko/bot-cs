import { COIN } from "@/shared-kernel/domain/currencies";
import { Money } from "@/shared/domain-primitives/money";
import { Percentage } from "@/shared/domain-primitives/percentage";
import { AtLeastOneBidSpecification } from "../specifications/at-least-one-bid.specification";
import { Below50CentSpecification } from "../specifications/below-50-cent.specification";

const atLeastOneBidSpecification = new AtLeastOneBidSpecification();
const below50CentSpecification = new Below50CentSpecification();

export class BidIncrementer {
    private static CURRENCY = COIN;

    static nextFor({ amount, numberOfBids }: { amount: number; numberOfBids: number }): number {
        if (atLeastOneBidSpecification.not().isSatisfiedBy(numberOfBids)) return amount;
        const ONE_UNIT = 1;
        const amountInCents = Money.fromCents({ amount, currency: BidIncrementer.CURRENCY });
        const onePercentOfAmount = amountInCents.percentageOf(Percentage.fromPercent("1"), "HALF_AWAY_FROM_ZERO");
        if (below50CentSpecification.isSatisfiedBy(amount)) {
            const oneCent = Money.fromCents({ amount: ONE_UNIT, currency: BidIncrementer.CURRENCY });
            return amountInCents.add(oneCent).getAmount();
        }
        return amountInCents.add(onePercentOfAmount).getAmount();
    }
}
