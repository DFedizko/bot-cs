import type { ISpecification } from "@/packages/building-blocks/specification";
import type { BidCandidate } from "../bid-candidate";

export enum ItemCriterionType {
    IS_WEAR = "IsWear",
}

export type CriterionPrimitives = { type: string; value: string };

export interface ItemCriterion extends ISpecification<BidCandidate> {
    readonly type: ItemCriterionType;
    describe(): string;
    toPrimitives(): CriterionPrimitives;
}
