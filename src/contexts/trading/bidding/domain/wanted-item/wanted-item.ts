import { AggregateRoot } from "@/packages/building-blocks/aggregate-root";
import { ItemName } from "./item-name";
import { BidCandidate, type CandidatePrimitives } from "./bid-candidate";
import type { ItemCriterion } from "./criteria/item-criterion";
import type { MaxFor, MaxForPrimitives } from "./max-for/max-for";
import { MaxForFactory } from "./max-for/max-for.factory";
import { CriteriaFactory, type CriteriaPrimitives } from "./criteria/criteria.factory";
import { AccountId } from "@/contexts/shared-kernel/domain/account-id";
import { EmptyWantedItemChangesError } from "./errors/empty-wanted-item-changes.error";
import { AddedAt } from "./added-at";

export type CreateWantedItemProps = {
    accountId: number;
    name: string;
    maxFor: MaxForPrimitives;
    criteria?: CriteriaPrimitives;
    addedAt: number;
};

export type WantedItemPrimitives = Required<CreateWantedItemProps> & {
    enabled: boolean;
};

export type WantedItemChanges = {
    maxFor?: MaxForPrimitives;
    criteria?: CriteriaPrimitives;
};

type BidDecision = {
    approved: boolean;
    skipped: boolean;
    maxPrice: number;
    failures: string[];
};

export class WantedItem extends AggregateRoot<ItemName> {
    static readonly DISABLED_FAILURE = "Disabled";
    private enabled = true;

    private constructor(
        id: ItemName,
        private readonly accountId: AccountId,
        private maxFor: MaxFor,
        private criteria: ItemCriterion[],
        private readonly addedAt: AddedAt,
    ) {
        super(id);
    }

    static create(props: CreateWantedItemProps): WantedItem {
        return new WantedItem(
            new ItemName(props.name),
            new AccountId(props.accountId),
            MaxForFactory.create(props.maxFor),
            CriteriaFactory.create(props.criteria ?? []),
            new AddedAt(props.addedAt),
        );
    }

    static fromPrimitives({ enabled, ...props }: WantedItemPrimitives): WantedItem {
        const wantedItem = WantedItem.create(props);
        wantedItem.enabled = enabled;
        return wantedItem;
    }

    toPrimitives(): WantedItemPrimitives {
        return {
            accountId: this.getAccountId(),
            name: this.getName(),
            maxFor: this.getMaxFor(),
            criteria: this.criteria.map((criterion) => criterion.toPrimitives()),
            enabled: this.enabled,
            addedAt: this.addedAt.getValue(),
        };
    }

    edit(changes: WantedItemChanges): void {
        this.rejectEmptyChanges(changes);
        const maxFor = this.parseMaxFor(changes.maxFor);
        const criteria = this.parseCriteria(changes.criteria);
        this.maxFor = maxFor;
        this.criteria = criteria;
    }

    enable(): void {
        this.enabled = true;
    }

    disable(): void {
        this.enabled = false;
    }

    isEnabled(): boolean {
        return this.enabled;
    }

    evaluate(candidateProps: CandidatePrimitives): BidDecision {
        const candidate = new BidCandidate(candidateProps);
        const maxPrice = this.maxFor.maxPriceFor(candidate).getAmount();
        const failures = this.findFailures(candidate);
        return { approved: !failures.length, skipped: !this.enabled, maxPrice, failures };
    }

    getId(): string {
        return this.getName();
    }

    getAccountId(): number {
        return this.accountId.getValue();
    }

    getMaxFor(): MaxForPrimitives {
        return this.maxFor.toPrimitives();
    }

    getName(): string {
        return this.id.getValue();
    }

    getCriteria(): string[] {
        return this.criteria.map((criterion) => criterion.type);
    }

    private findFailures(candidate: BidCandidate): string[] {
        if (!this.enabled) return [WantedItem.DISABLED_FAILURE];
        return [...this.findPriceFailures(candidate), ...this.findCriteriaFailures(candidate)];
    }

    private findPriceFailures(candidate: BidCandidate): string[] {
        return this.maxFor.isSatisfiedBy(candidate) ? [] : [this.maxFor.describe()];
    }

    private findCriteriaFailures(candidate: BidCandidate): string[] {
        return this.criteria
            .filter((criterion) => criterion.not().isSatisfiedBy(candidate))
            .map((criterion) => criterion.describe());
    }

    private rejectEmptyChanges({ maxFor, criteria }: WantedItemChanges): void {
        if (maxFor === undefined && criteria === undefined) throw new EmptyWantedItemChangesError();
    }

    private parseMaxFor(maxFor?: MaxForPrimitives): MaxFor {
        return maxFor === undefined ? this.maxFor : MaxForFactory.create(maxFor);
    }

    private parseCriteria(criteria?: CriteriaPrimitives): ItemCriterion[] {
        return criteria === undefined ? this.criteria : CriteriaFactory.create(criteria);
    }
}
