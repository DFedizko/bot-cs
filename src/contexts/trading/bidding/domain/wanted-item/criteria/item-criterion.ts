import type { ISpecification } from "@/packages/building-blocks/specification";
import type { BidCandidate } from "../bid-candidate";

export enum ItemCriterionType {
    IS_WEAR = "IsWear",
}

export interface ItemCriterion extends ISpecification<BidCandidate> {
    readonly type: ItemCriterionType;
    describe(): string;
}
