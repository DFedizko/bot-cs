import { IsWear } from "./is-wear";
import { ItemCriterionType, ItemCriterion } from "./item-criterion";

export type CriteriaPrimitives = { type: ItemCriterionType; value: string }[];

const criteriaMap = {
    [ItemCriterionType.IS_WEAR]: (raw) => new IsWear(raw),
} satisfies Record<ItemCriterionType, (raw: string) => ItemCriterion>;

export class CriteriaFactory {
    static create(criteriaProps: CriteriaPrimitives): ItemCriterion[] {
        const criteria = criteriaProps.map((criterion) => criteriaMap[criterion.type](criterion.value));
        return criteria;
    }
}
