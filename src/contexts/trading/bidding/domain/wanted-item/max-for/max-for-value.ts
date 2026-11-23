import { Specification } from "@/packages/building-blocks/specification";
import type { Money } from "@/packages/domain-primitives/money";
import { CoinCent } from "@/contexts/trading/shared/domain/coin-cent";
import type { BidCandidate } from "../bid-candidate";
import { NonPositiveMaxValueError } from "../errors/non-positive-max-value.error";
import { MaxForType, type MaxFor, type MaxForPrimitives } from "./max-for";

export class MaxForValue extends Specification<BidCandidate> implements MaxFor {
    readonly type = MaxForType.VALUE;
    private readonly maxValue: Money;

    constructor(cents: number) {
        super();
        this.maxValue = CoinCent(cents);
        if (!this.maxValue.isPositive()) throw new NonPositiveMaxValueError(cents);
    }

    maxPriceFor(): Money {
        return this.maxValue;
    }

    isSatisfiedBy(candidate: BidCandidate): boolean {
        return candidate.getBidValue().isLessOrEqualThan(this.maxValue);
    }

    describe(): string {
        return `AboveMaxValue(${this.maxValue.toCents()})`;
    }

    toPrimitives(): MaxForPrimitives {
        return { type: this.type, value: this.maxValue.toCents() };
    }
}
