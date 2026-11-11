import { ItemValue } from "./item-value";
import { ValueObject } from "@/packages/building-blocks/value-object";
import type { WearName } from "@/contexts/shared-kernel/domain/wear-name";
import { AboveRecommendedPercentage } from "./above-recommended-percentage";
import { ReferencePrice } from "./reference-price";
import { CoinCent } from "@/contexts/trading/shared/domain/coin-cent";

export type CandidatePrimitives = {
    value: number;
    referencePrice: number;
    aboveRecommendedPercentage: string;
    wearName?: WearName;
};

export class BidCandidate extends ValueObject<{
    value: ItemValue;
    referencePrice: ReferencePrice;
    aboveRecommendedPercentage: AboveRecommendedPercentage;
    wearName?: WearName;
}> {
    constructor(props: CandidatePrimitives) {
        super({
            value: CoinCent(props.value),
            referencePrice: CoinCent(props.referencePrice),
            aboveRecommendedPercentage: AboveRecommendedPercentage.fromPercent(props.aboveRecommendedPercentage),
            wearName: props.wearName,
        });
    }

    getBidValue(): ItemValue {
        return this.value.value;
    }

    getAboveRecommendedPercentage(): AboveRecommendedPercentage {
        return this.value.aboveRecommendedPercentage;
    }

    getWearName(): WearName | undefined {
        return this.value.wearName;
    }
}
