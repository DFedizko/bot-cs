import { RemoveWantedItemCommand } from "@/contexts/trading/bidding/application/remove-wanted-tem/remove-wanted-item.command";
import type { WantedItemRepository } from "@/contexts/trading/bidding/application/wanted-item.repository";
import { ItemName } from "@/contexts/trading/bidding/domain/wanted-item/item-name";
import { WantedItem } from "@/contexts/trading/bidding/domain/wanted-item/wanted-item";
import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import { testContainer } from "@/__builders__/test-container.builder";
import {
    REMOVE_WANTED_ITEM_HANDLER,
    WANTED_ITEM_REPOSITORY,
} from "@/contexts/trading/bidding/external/di/bidding.identifiers";

let wantedItemRepo: WantedItemRepository;
let removeWantedItemCommandHandler: CommandHandler<RemoveWantedItemCommand>;
describe("RemoveWantedItemCommandHandler", () => {
    beforeEach(() => {
        const container = testContainer();
        wantedItemRepo = container.get(WANTED_ITEM_REPOSITORY);
        removeWantedItemCommandHandler = container.get(REMOVE_WANTED_ITEM_HANDLER);
    });

    it("Should remove an wanted item", async () => {
        await wantedItemRepo.save(WantedItem.create({ name: "Foo Wanted Item", maxFor: "10" }));
        await removeWantedItemCommandHandler.handle(new RemoveWantedItemCommand("Foo Wanted Item"));
        const wantedItem = await wantedItemRepo.findByName(new ItemName("Foo Wanted Item"));
        expect(wantedItem).toBe(undefined);
    });
});
