import { IsWear } from "./is-wear";
import { ItemCriterionType, ItemCriterion, type CriterionPrimitives } from "./item-criterion";
import { UnknownCriterionError } from "../errors/unknown-criterion.error";

export type CriteriaPrimitives = CriterionPrimitives[];

const criteriaMap = {
    [ItemCriterionType.IS_WEAR]: (raw) => new IsWear(raw),
} satisfies Record<ItemCriterionType, (raw: string) => ItemCriterion>;

export class CriteriaFactory {
    static create(criteriaProps: CriteriaPrimitives): ItemCriterion[] {
        return criteriaProps.map((criterion) => CriteriaFactory.createOne(criterion));
    }

    private static createOne({ type, value }: CriterionPrimitives): ItemCriterion {
        if (!CriteriaFactory.isKnownType(type)) throw new UnknownCriterionError(type);
        return criteriaMap[type](value);
    }

    private static isKnownType(type: string): type is ItemCriterionType {
        return Object.hasOwn(criteriaMap, type);
    }
}
