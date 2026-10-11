import { Specification } from "@/shared/building-blocks/specification";
import { AboveRecommendedPercentage } from "../value-objects/above-recommended-percentage";

export class MaxAboveRecommendedPercentage extends Specification<string> {
    readonly maxPercentage: AboveRecommendedPercentage;

    constructor(maxPercentage: string) {
        super();
        this.maxPercentage = AboveRecommendedPercentage.fromPercent(maxPercentage);
    }

    isSatisfiedBy(candidate: string): boolean {
        return (
            AboveRecommendedPercentage.fromPercent(candidate).isLessThan(this.maxPercentage) ||
            AboveRecommendedPercentage.fromPercent(candidate).equals(this.maxPercentage)
        );
    }
}
