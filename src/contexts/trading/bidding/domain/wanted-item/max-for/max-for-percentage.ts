import { Specification } from "@/packages/building-blocks/specification";
import type { Money } from "@/packages/domain-primitives/money";
import type { BidCandidate } from "../bid-candidate";
import { AboveRecommendedPercentage } from "../above-recommended-percentage";
import { MaxForType, type MaxFor, type MaxForPrimitives } from "./max-for";

export class MaxForPercentage extends Specification<BidCandidate> implements MaxFor {
    readonly type = MaxForType.PERCENTAGE;
    private readonly percentage: AboveRecommendedPercentage;

    constructor(percent: string) {
        super();
        this.percentage = AboveRecommendedPercentage.fromPercent(percent);
    }

    maxPriceFor(candidate: BidCandidate): Money {
        return candidate.getReferencePrice().applyPercentage(this.percentage);
    }

    isSatisfiedBy(candidate: BidCandidate): boolean {
        return !candidate.getAboveRecommendedPercentage().isGreaterThan(this.percentage);
    }

    describe(): string {
        return `AboveRecommendedPercentage(${this.percentage.toString()})`;
    }

    toPrimitives(): MaxForPrimitives {
        return { type: this.type, value: this.percentage.toPercentString() };
    }
}
