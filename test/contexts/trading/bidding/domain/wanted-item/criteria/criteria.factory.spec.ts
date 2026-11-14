import { WearName } from "@/contexts/shared-kernel/domain/wear-name";
import { CriteriaFactory } from "@/contexts/trading/bidding/domain/wanted-item/criteria/criteria.factory";
import { IsWear } from "@/contexts/trading/bidding/domain/wanted-item/criteria/is-wear";
import { ItemCriterionType } from "@/contexts/trading/bidding/domain/wanted-item/criteria/item-criterion";

test("Should build a criterion from your type and value", () =>
    expect(CriteriaFactory.create([{ type: ItemCriterionType.IS_WEAR, value: WearName.FIELD_TESTED }])).toEqual([
        new IsWear(WearName.FIELD_TESTED),
    ]));
