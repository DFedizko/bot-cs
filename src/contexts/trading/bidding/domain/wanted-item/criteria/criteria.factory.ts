import { IsWear } from "./is-wear";
import { ItemCriterionType, ItemCriterion } from "./item-criterion";

const criteriaMap = {
    [ItemCriterionType.IS_WEAR]: (raw) => new IsWear(raw),
} satisfies Record<ItemCriterionType, (raw: string) => ItemCriterion>;

export class CriteriaFactory {
    static create(criteriaProps: { type: ItemCriterionType; value: string }[]): ItemCriterion[] {
        const criteria = criteriaProps.map((criterion) => criteriaMap[criterion.type](criterion.value));
        return criteria;
    }
}
