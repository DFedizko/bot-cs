import type { ISpecification } from "@/packages/building-blocks/specification";
import type { Money } from "@/packages/domain-primitives/money";
import type { BidCandidate } from "../bid-candidate";

export enum MaxForType {
    PERCENTAGE = "percentage",
    VALUE = "value",
}

type MaxForValueOf = {
    [MaxForType.PERCENTAGE]: string;
    [MaxForType.VALUE]: number;
};

export type MaxForPrimitives<K extends MaxForType = MaxForType> = {
    [T in K]: { type: T; value: MaxForValueOf[T] };
}[K];

export interface MaxFor extends ISpecification<BidCandidate> {
    readonly type: MaxForType;
    maxPriceFor(candidate: BidCandidate): Money;
    describe(): string;
    toPrimitives(): MaxForPrimitives;
}
