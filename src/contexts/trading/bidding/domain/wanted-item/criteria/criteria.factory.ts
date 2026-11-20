import { IsWear } from "./is-wear";
import { ItemCriterionType, ItemCriterion } from "./item-criterion";
import { UnknownCriterionError } from "../errors/unknown-criterion.error";

export type CriteriaPrimitives = { type: ItemCriterionType; value: string }[];

type CriterionPrimitives = CriteriaPrimitives[number];

const criteriaMap = {
    [ItemCriterionType.IS_WEAR]: (raw) => new IsWear(raw),
} satisfies Record<ItemCriterionType, (raw: string) => ItemCriterion>;

export class CriteriaFactory {
    static create(criteriaProps: CriteriaPrimitives): ItemCriterion[] {
        return criteriaProps.map((criterion) => CriteriaFactory.createOne(criterion));
    }

    private static createOne({ type, value }: CriterionPrimitives): ItemCriterion {
        if (!Object.hasOwn(criteriaMap, type)) throw new UnknownCriterionError(type);
        return criteriaMap[type](value);
    }
}
