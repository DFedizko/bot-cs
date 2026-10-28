import { AggregateRoot } from "@/packages/building-blocks/aggregate-root";
import { ItemName } from "../value-objects/item-name";
import { BidCandidate, type CandidatePrimitives } from "./bid-candidate";
import type { ItemCriterion } from "./item-criterion";

type CreateWantedSkinProps = {
    name: string;
    criteria: ItemCriterion[];
};

type BidDecision = {
    approved: boolean;
    failures: string[];
};

export class WantedItem extends AggregateRoot<ItemName> {
    private constructor(
        id: ItemName,
        private readonly criteria: ItemCriterion[],
    ) {
        super(id);
    }

    static create(props: CreateWantedSkinProps): WantedItem {
        return new WantedItem(new ItemName(props.name), props.criteria);
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
