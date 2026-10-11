import { Specification } from "@/shared/building-blocks/specification";
import { Percentage } from "@/shared/domain-primitives/percentage";

export class MaxAboveRecommendedSpecification extends Specification<string> {
    readonly maxPercentage: Percentage;

    constructor(maxPercentage: string) {
        super();
        this.maxPercentage = Percentage.fromPercent(maxPercentage);
    }

    isSatisfiedBy(candidate: string): boolean {
        return (
            Percentage.fromPercent(candidate).isLessThan(this.maxPercentage) ||
            Percentage.fromPercent(candidate).equals(this.maxPercentage)
        );
    }
}
