import { Specification } from "@/packages/building-blocks/specification";
import type { BidCandidate } from "../bid-candidate";
import { ItemCriterionType, type ItemCriterion } from "./item-criterion";
import { WearName } from "@/contexts/shared-kernel/domain/wear-name";
import { DomainError } from "@/packages/error/domain-error";

export class IsWear extends Specification<BidCandidate> implements ItemCriterion {
    readonly type = ItemCriterionType.IS_WEAR;
    private readonly wearName: WearName;

    constructor(rawWearName: string) {
        super();
        if (!this.isWearName(rawWearName)) throw new DomainError({ message: `Invalid wear name: "${rawWearName}"` });
        this.wearName = rawWearName;
    }

    describe(): string {
        return `${this.type}(${this.wearName})`;
    }

    isSatisfiedBy(candidate: BidCandidate): boolean {
        return candidate?.getWearName() === this.wearName;
    }

    private isWearName(value: string): value is WearName {
        return (Object.values(WearName) as string[]).includes(value);
    }
}
