import { Specification } from "@/packages/building-blocks/specification";
import type { BidCandidate } from "../bid-candidate";
import { ItemCriterionType, type ItemCriterion } from "./item-criterion";
import { WearName } from "@/contexts/shared-kernel/domain/wear-name";

export class IsWear extends Specification<BidCandidate> implements ItemCriterion {
    readonly type = ItemCriterionType.IS_WEAR;

    constructor(private readonly wearName: WearName) {
        super();
    }

    describe(): string {
        return `${this.type}(${this.wearName})`;
    }

    isSatisfiedBy(candidate: BidCandidate): boolean {
        return candidate?.getWearName() === this.wearName;
    }
}
