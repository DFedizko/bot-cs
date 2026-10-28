import { Specification } from "@/packages/building-blocks/specification";
import { AboveRecommendedPercentage } from "../../value-objects/above-recommended-percentage";
import type { BidCandidate } from "../bid-candidate";
import type { ItemCriterion } from "../item-criterion";

export class MaxAboveRecommendedPercentage extends Specification<BidCandidate> implements ItemCriterion {
    readonly maxPercentage: AboveRecommendedPercentage;
    readonly type = "MaxAboveRecommendedPercentage" as const;

    constructor(maxPercentage: string) {
        super();
        this.maxPercentage = AboveRecommendedPercentage.fromPercent(maxPercentage);
    }

    describe(): string {
        return `${this.type}(${this.maxPercentage.toString()})`;
    }

    isSatisfiedBy(candidate: BidCandidate): boolean {
        return candidate.getAboveRecommendedPercentage().isLessOrEqualThan(this.maxPercentage);
    }
}
