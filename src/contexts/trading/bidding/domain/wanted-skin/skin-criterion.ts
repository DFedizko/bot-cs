import { Specification } from "@/shared/building-blocks/specification";
import { BidCandidate } from "./bid-candidate";

export interface SkinCriterion extends Specification<BidCandidate> {
	readonly type: string;
	describe(): string;
}
