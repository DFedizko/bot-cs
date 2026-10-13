import { BidCandidate } from "@/contexts/trading/bidding/domain/wanted-skin/bid-candidate";

export const bidCandidate = (
    overrides: Partial<{ value: number; aboveRecommendedPercentage: string }> = {},
): BidCandidate => {
    return new BidCandidate({
        value: overrides.value ?? 1000,
        aboveRecommendedPercentage: overrides.aboveRecommendedPercentage ?? "0",
    });
};
