import type { Container } from "inversify";
import { RemoveWantedItemCommand } from "@/contexts/trading/bidding/application/remove-wanted-tem/remove-wanted-item.command";
import { ItemName } from "@/contexts/trading/bidding/domain/wanted-item/item-name";
import { WantedItem } from "@/contexts/trading/bidding/domain/wanted-item/wanted-item";
import { testContainer } from "@/__builders__/test-container.builder";
import {
    REMOVE_WANTED_ITEM_HANDLER,
    WANTED_ITEM_REPOSITORY,
} from "@/contexts/trading/bidding/external/di/bidding.identifiers";

let container: Container;

describe("RemoveWantedItemCommandHandler", () => {
    beforeEach(() => {
        container = testContainer();
    });

    it("Should remove an wanted item", async () => {
        const wantedItemRepo = container.get(WANTED_ITEM_REPOSITORY);
        await wantedItemRepo.save(WantedItem.create({ name: "Foo Wanted Item", maxFor: "10" }));

        await container.get(REMOVE_WANTED_ITEM_HANDLER).handle(new RemoveWantedItemCommand("Foo Wanted Item"));

        const wantedItem = await wantedItemRepo.findByName(new ItemName("Foo Wanted Item"));
        expect(wantedItem).toBe(undefined);
    });
});
