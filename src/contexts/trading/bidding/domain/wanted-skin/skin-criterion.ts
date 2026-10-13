import type { ISpecification } from "@/shared/building-blocks/specification";
import { BidCandidate } from "./bid-candidate";

export interface SkinCriterion extends ISpecification<BidCandidate> {
    readonly type: string;
    describe(): string;
}
