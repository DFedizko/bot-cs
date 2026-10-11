import { AboveRecommendedPercentage } from "@/contexts/trading/bidding/domain/value-objects/above-recommended-percentage";
import { BidValue } from "@/contexts/trading/bidding/domain/value-objects/bid-value";
import type { BidCandidate } from "@/contexts/trading/bidding/domain/wanted-skin/bid-candidate";
import { COIN } from "@/shared-kernel/domain/currencies";

export const bidCandidate = (
    overrides: Partial<{ value: number; aboveRecommendedPercentage: string }> = {},
): BidCandidate => {
    return {
        value: BidValue.fromCents({ amount: overrides.value ?? 1000, currency: COIN }),
        aboveRecommendedPercentage: AboveRecommendedPercentage.fromPercent(overrides.aboveRecommendedPercentage ?? "0"),
    };
};
