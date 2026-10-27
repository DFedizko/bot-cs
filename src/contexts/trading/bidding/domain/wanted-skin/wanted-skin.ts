import { AggregateRoot } from "@/packages/building-blocks/aggregate-root";
import { SkinName } from "../value-objects/skin-name";
import { BidCandidate, type CandidatePrimitives } from "./bid-candidate";
import type { SkinCriterion } from "./skin-criterion";

type CreateWantedSkinProps = {
    name: string;
    criteria: SkinCriterion[];
};

type BidDecision = {
    approved: boolean;
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

    evaluate(candidateProps: CandidatePrimitives): BidDecision {
        const candidate = new BidCandidate(candidateProps);
        const failures: string[] = [];
        this.criteria.forEach(
            (criterion) => criterion.not().isSatisfiedBy(candidate) && failures.push(criterion.describe()),
        );
        return { approved: !failures.length, failures };
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
