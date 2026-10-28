import { BidValue } from "../value-objects/bid-value";
import { AboveRecommendedPercentage } from "../value-objects/above-recommended-percentage";
import { ValueObject } from "@/packages/building-blocks/value-object";
import { COIN } from "@/contexts/shared-kernel/domain/currencies";

export type CandidatePrimitives = {
    value: number;
    aboveRecommendedPercentage: string;
};

export class BidCandidate extends ValueObject<{
    value: BidValue;
    aboveRecommendedPercentage: AboveRecommendedPercentage;
}> {
    constructor(props: CandidatePrimitives) {
        super({
            value: BidValue.fromCents({ amount: props.value, currency: COIN }),
            aboveRecommendedPercentage: AboveRecommendedPercentage.fromPercent(props.aboveRecommendedPercentage),
        });
    }

    getAboveRecommendedPercentage(): AboveRecommendedPercentage {
        return this.value.aboveRecommendedPercentage;
    }

    getBidValue(): BidValue {
        return this.value.value;
    }
}
