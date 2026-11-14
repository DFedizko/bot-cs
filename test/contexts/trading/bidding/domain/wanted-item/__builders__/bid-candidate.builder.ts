import { WearName } from "@/contexts/shared-kernel/domain/wear-name";
import { BidCandidate } from "@/contexts/trading/bidding/domain/wanted-item/bid-candidate";

export const bidCandidate = (
    overrides: Partial<{
        value: number;
        aboveRecommendedPercentage: string;
        wearName: WearName;
        referencePrice: number;
    }> = {},
): BidCandidate => {
    return new BidCandidate({
        value: overrides.value ?? 1000,
        aboveRecommendedPercentage: overrides.aboveRecommendedPercentage ?? "0",
        wearName: overrides.wearName ?? WearName.FIELD_TESTED,
        referencePrice: overrides.referencePrice ?? 1000,
    });
};
