import { AggregateRoot } from "@/packages/building-blocks/aggregate-root";
import { ItemName } from "./item-name";
import { BidCandidate, type CandidatePrimitives } from "./bid-candidate";
import type { ItemCriterion } from "./item-criterion";
import { AboveRecommendedPercentage } from "./above-recommended-percentage";
import { CoinCent } from "@/contexts/trading/shared/domain/coin-cent";

type CreateWantedSkinProps = {
    name: string;
    maxFor: string;
    criteria?: ItemCriterion[];
};

type BidDecision = {
    approved: boolean;
    maxPrice: number;
    failures: string[];
};

export class WantedItem extends AggregateRoot<ItemName> {
    private constructor(
        id: ItemName,
        private readonly maxFor: AboveRecommendedPercentage,
        private readonly criteria: ItemCriterion[],
    ) {
        super(id);
    }

    static create(props: CreateWantedSkinProps): WantedItem {
        return new WantedItem(
            new ItemName(props.name),
            AboveRecommendedPercentage.fromPercent(props.maxFor),
            props?.criteria ?? [],
        );
    }

    evaluate(candidateProps: CandidatePrimitives): BidDecision {
        const candidate = new BidCandidate(candidateProps);
        const failures: string[] = [];
        const maxPrice = CoinCent(candidateProps.referencePrice).applyPercentage(this.maxFor).getAmount();
        if (candidate.getAboveRecommendedPercentage().isGreaterThan(this.maxFor)) {
            failures.push(`AboveRecommendedPercentage(${this.maxFor.toString()})`);
        }
        this.criteria.forEach(
            (criterion) => criterion.not().isSatisfiedBy(candidate) && failures.push(criterion.describe()),
        );
        return { approved: !failures.length, maxPrice, failures };
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
