import type { ISpecification } from "@/packages/building-blocks/specification";
import { BidCandidate } from "./bid-candidate";

export interface ItemCriterion extends ISpecification<BidCandidate> {
    readonly type: string;
    describe(): string;
}
