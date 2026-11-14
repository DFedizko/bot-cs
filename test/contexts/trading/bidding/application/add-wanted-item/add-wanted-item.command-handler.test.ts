import { WearName } from "@/contexts/shared-kernel/domain/wear-name";
import { AddWantedItemCommand } from "@/contexts/trading/bidding/application/add-wanted-item/add-wanted-item.command";
import { AddWantedItemCommandHandler } from "@/contexts/trading/bidding/application/add-wanted-item/add-wanted-item.command-handler";
import type { WantedItemRepository } from "@/contexts/trading/bidding/application/wanted-item.repository";
import { ItemCriterionType } from "@/contexts/trading/bidding/domain/wanted-item/criteria/item-criterion";
import { WantedItemRepositoryInMemory } from "@/contexts/trading/bidding/infrastructure/repositories/wanted-item.repository.in-memory";
import type { CommandHandler } from "@/packages/building-blocks/command-handler";

let wantedItemRepo: WantedItemRepository;
let addWantedItemCommandHandler: CommandHandler<AddWantedItemCommand>;
describe("AddWantedItemCommandHandler", () => {
    beforeEach(() => {
        wantedItemRepo = new WantedItemRepositoryInMemory();
        addWantedItemCommandHandler = new AddWantedItemCommandHandler(wantedItemRepo);
    });

    it("Should create and add wanted items", async () => {
        const input = {
            name: "AWP | Asiimov (Field-Tested)",
            maxFor: "-3",
            criteria: [{ type: ItemCriterionType.IS_WEAR, value: WearName.FIELD_TESTED }],
        };
        const command = new AddWantedItemCommand(input);
        await addWantedItemCommandHandler.handle(command);
        const wantedItem = await wantedItemRepo.findByName(input.name);
        expect(wantedItem?.getId()).toBe(input.name);
        expect(wantedItem?.getName()).toBe(input.name);
        expect(wantedItem?.getCriteria()).toEqual(["IsWear"]);
    });
});
