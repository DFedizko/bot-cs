import { AggregateRoot } from "@/shared/building-blocks/aggregate-root";
import { SkinName } from "../value-objects/skin-name";
import type { BidCandidate } from "./bid-candidate";
import type { SkinCriterion } from "./skin-criterion";

type CreateWantedSkinProps = {
    name: string;
    criteria: SkinCriterion[];
};

type BidDecision = {
    decision: "approved" | "rejected";
    failures: string[];
};

export class WantedSkin extends AggregateRoot<SkinName> {
    private constructor(
        id: SkinName,
        private readonly criteria: SkinCriterion[],
    ) {
        super(id);
    }

    static create(props: CreateWantedSkinProps): WantedSkin {
        return new WantedSkin(new SkinName(props.name), props.criteria);
    }

    evaluate(candidate: BidCandidate): BidDecision {
        const failures: string[] = [];
        this.criteria.forEach(
            (criterion) => criterion.not().isSatisfiedBy(candidate) && failures.push(criterion.describe()),
        );
        return { decision: failures.length ? "rejected" : "approved", failures };
    }

    getId(): string {
        return this.getName();
    }

    getName(): string {
        return this.id.getValue();
    }

    getCriteria(): string[] {
        return this.criteria.map((criterion) => criterion.type);
    }
}
