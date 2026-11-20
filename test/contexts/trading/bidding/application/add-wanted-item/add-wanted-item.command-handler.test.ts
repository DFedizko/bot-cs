import type { Container } from "inversify";
import { WearName } from "@/contexts/shared-kernel/domain/wear-name";
import { AddWantedItemCommand } from "@/contexts/trading/bidding/application/add-wanted-item/add-wanted-item.command";
import { ItemCriterionType } from "@/contexts/trading/bidding/domain/wanted-item/criteria/item-criterion";
import { ItemName } from "@/contexts/trading/bidding/domain/wanted-item/item-name";
import { testContainer } from "@/__builders__/test-container.builder";
import {
    ADD_WANTED_ITEM_HANDLER,
    WANTED_ITEM_REPOSITORY,
} from "@/contexts/trading/bidding/external/di/bidding.identifiers";

let container: Container;

describe("AddWantedItemCommandHandler", () => {
    beforeEach(() => {
        container = testContainer();
    });

    it("Should create and add wanted items", async () => {
        const input = {
            name: "AWP | Asiimov (Field-Tested)",
            maxFor: "-3",
            criteria: [{ type: ItemCriterionType.IS_WEAR, value: WearName.FIELD_TESTED }],
        };
        const command = new AddWantedItemCommand(input);

        await container.get(ADD_WANTED_ITEM_HANDLER).handle(command);

        const wantedItem = await container.get(WANTED_ITEM_REPOSITORY).findByName(new ItemName(input.name));
        expect(wantedItem?.getId()).toBe(input.name);
        expect(wantedItem?.getName()).toBe(input.name);
        expect(wantedItem?.getMaxFor()).toBe(input.maxFor);
        expect(wantedItem?.getCriteria()).toEqual(["IsWear"]);
    });
});
