import { BidValue } from "../value-objects/bid-value";
import { AboveRecommendedPercentage } from "../value-objects/above-recommended-percentage";

export interface BidCandidate {
    readonly value: BidValue;
    readonly aboveRecommendedPercentage: AboveRecommendedPercentage;
}
