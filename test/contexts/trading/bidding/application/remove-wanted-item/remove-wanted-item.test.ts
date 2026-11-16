import { RemoveWantedItemCommand } from "@/contexts/trading/bidding/application/remove-wanted-tem/remove-wanted-item.command";
import { RemoveWantedItemCommandHandler } from "@/contexts/trading/bidding/application/remove-wanted-tem/remove-wanted-item.command-handler";
import type { WantedItemRepository } from "@/contexts/trading/bidding/application/wanted-item.repository";
import { ItemName } from "@/contexts/trading/bidding/domain/wanted-item/item-name";
import { WantedItem } from "@/contexts/trading/bidding/domain/wanted-item/wanted-item";
import { WantedItemRepositoryInMemory } from "@/contexts/trading/bidding/infrastructure/repositories/wanted-item.repository.in-memory";
import type { CommandHandler } from "@/packages/building-blocks/command-handler";

let wantedItemRepo: WantedItemRepository;
let removeWantedItemCommandHandler: CommandHandler<RemoveWantedItemCommand>;
describe("RemoveWantedItem", () => {
    beforeEach(() => {
        wantedItemRepo = new WantedItemRepositoryInMemory();
        removeWantedItemCommandHandler = new RemoveWantedItemCommandHandler(wantedItemRepo);
    });

    it("Should remove an wanted item", async () => {
        await wantedItemRepo.save(WantedItem.create({ name: "Foo Wanted Item", maxFor: "10" }));
        await removeWantedItemCommandHandler.handle(new RemoveWantedItemCommand("Foo Wanted Item"));
        const wantedItem = await wantedItemRepo.findByName(new ItemName("Foo Wanted Item"));
        expect(wantedItem).toBe(undefined);
    });
});
