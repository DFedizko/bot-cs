import { AggregateRoot } from "@/packages/building-blocks/aggregate-root";
import { ItemName } from "./item-name";
import { BidCandidate, type CandidatePrimitives } from "./bid-candidate";
import type { ItemCriterion } from "./criteria/item-criterion";
import { AboveRecommendedPercentage } from "./above-recommended-percentage";
import { CoinCent } from "@/contexts/trading/shared/domain/coin-cent";
import { CriteriaFactory, type CriteriaPrimitives } from "./criteria/criteria.factory";
import { AccountId } from "../account/account-id";
import { EmptyWantedItemChangesError } from "./errors/empty-wanted-item-changes.error";

type CreateWantedSkinProps = {
    accountId: number;
    name: string;
    maxFor: string;
    criteria?: CriteriaPrimitives;
};

export type WantedItemChanges = {
    maxFor?: string;
    criteria?: CriteriaPrimitives;
};

type BidDecision = {
    approved: boolean;
    maxPrice: number;
    failures: string[];
};

export class WantedItem extends AggregateRoot<ItemName> {
    private constructor(
        id: ItemName,
        private readonly accountId: AccountId,
        private maxFor: AboveRecommendedPercentage,
        private criteria: ItemCriterion[],
    ) {
        super(id);
    }

    static create(props: CreateWantedSkinProps): WantedItem {
        return new WantedItem(
            new ItemName(props.name),
            new AccountId(props.accountId),
            AboveRecommendedPercentage.fromPercent(props.maxFor),
            CriteriaFactory.create(props.criteria ?? []),
        );
    }

    edit(changes: WantedItemChanges): void {
        this.rejectEmptyChanges(changes);
        const maxFor = this.parseMaxFor(changes.maxFor);
        const criteria = this.parseCriteria(changes.criteria);
        this.maxFor = maxFor;
        this.criteria = criteria;
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

    getAccountId(): number {
        return this.accountId.getValue();
    }

    getMaxFor(): string {
        return this.maxFor.toPercentString();
    }

    getName(): string {
        return this.id.getValue();
    }

    getCriteria(): string[] {
        return this.criteria.map((criterion) => criterion.type);
    }

    private rejectEmptyChanges({ maxFor, criteria }: WantedItemChanges): void {
        if (maxFor === undefined && criteria === undefined) throw new EmptyWantedItemChangesError();
    }

    private parseMaxFor(maxFor?: string): AboveRecommendedPercentage {
        return maxFor === undefined ? this.maxFor : AboveRecommendedPercentage.fromPercent(maxFor);
    }

    private parseCriteria(criteria?: CriteriaPrimitives): ItemCriterion[] {
        return criteria === undefined ? this.criteria : CriteriaFactory.create(criteria);
    }
}
