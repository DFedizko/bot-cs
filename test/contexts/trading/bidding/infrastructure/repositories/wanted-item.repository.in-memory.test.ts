import type { Container } from "inversify";
import { maxForPercentage } from "@/contexts/trading/bidding/domain/wanted-item/__builders__/max-for.builder";
import { testContainer } from "@/__builders__/test-container.builder";
import { WANTED_ITEM_REPOSITORY } from "@/contexts/trading/bidding/external/di/bidding.identifiers";
import { WantedItem } from "@/contexts/trading/bidding/domain/wanted-item/wanted-item";
import { AccountId } from "@/contexts/trading/bidding/domain/account/account-id";
import { ItemName } from "@/contexts/trading/bidding/domain/wanted-item/item-name";

const ACCOUNT_ID = 1;
const OTHER_ACCOUNT_ID = 2;
const ITEM_NAME = "AWP | Asiimov (Field-Tested)";

const asiimov = (accountId: number, maxFor = "-3") =>
    WantedItem.create({ accountId, name: ITEM_NAME, maxFor: maxForPercentage(maxFor) });

let container: Container;

describe("WantedItemRepositoryInMemory", () => {
    beforeEach(() => {
        container = testContainer();
    });

    it("Should save and find a wanted item by account and name", async () => {
        const repository = container.get(WANTED_ITEM_REPOSITORY);
        await repository.save(asiimov(ACCOUNT_ID));

        const wantedItem = await repository.findByName(new AccountId(ACCOUNT_ID), new ItemName(ITEM_NAME));

        expect(wantedItem?.getAccountId()).toBe(ACCOUNT_ID);
    });

    it("Should not find the wanted item of another account", async () => {
        const repository = container.get(WANTED_ITEM_REPOSITORY);
        await repository.save(asiimov(ACCOUNT_ID));

        const wantedItem = await repository.findByName(new AccountId(OTHER_ACCOUNT_ID), new ItemName(ITEM_NAME));

        expect(wantedItem).toBeUndefined();
    });

    it("Should keep the same item of each account apart", async () => {
        const repository = container.get(WANTED_ITEM_REPOSITORY);
        await repository.save(asiimov(ACCOUNT_ID, "-3"));
        await repository.save(asiimov(OTHER_ACCOUNT_ID, "5"));

        const wantedItem = await repository.findByName(new AccountId(ACCOUNT_ID), new ItemName(ITEM_NAME));

        expect(wantedItem?.getMaxFor()).toEqual(maxForPercentage("-3"));
    });

    it("Should remove only the wanted item of the given account", async () => {
        const repository = container.get(WANTED_ITEM_REPOSITORY);
        await repository.save(asiimov(ACCOUNT_ID));
        await repository.save(asiimov(OTHER_ACCOUNT_ID));

        await repository.removeByName(new AccountId(ACCOUNT_ID), new ItemName(ITEM_NAME));

        const remaining = await Promise.all(
            [ACCOUNT_ID, OTHER_ACCOUNT_ID].map((id) =>
                repository.findByName(new AccountId(id), new ItemName(ITEM_NAME)),
            ),
        );
        expect(remaining.map((wantedItem) => wantedItem?.getAccountId())).toEqual([undefined, OTHER_ACCOUNT_ID]);
    });
});
