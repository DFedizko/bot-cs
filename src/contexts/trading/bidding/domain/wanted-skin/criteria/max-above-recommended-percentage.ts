import { Specification } from "@/shared/building-blocks/specification";
import { AboveRecommendedPercentage } from "../../value-objects/above-recommended-percentage";
import type { BidCandidate } from "../bid-candidate";
import type { SkinCriterion } from "../skin-criterion";

export class MaxAboveRecommendedPercentage extends Specification<BidCandidate> implements SkinCriterion {
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
        return (
            candidate.getAboveRecommendedPercentage().isLessThan(this.maxPercentage) ||
            candidate.getAboveRecommendedPercentage().equals(this.maxPercentage)
        );
    }
}
