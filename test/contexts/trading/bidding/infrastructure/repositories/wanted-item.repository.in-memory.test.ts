import { buildWantedItem } from "@/contexts/trading/bidding/domain/wanted-item/__builders__/wanted-item.builder";
import type { Container } from "inversify";
import { maxForPercentage } from "@/contexts/trading/bidding/domain/wanted-item/__builders__/max-for.builder";
import { testContainer } from "@/__builders__/test-container.builder";
import { WANTED_ITEM_REPOSITORY, WANTED_ITEM_STORE } from "@/contexts/trading/bidding/external/di/bidding.identifiers";
import { AccountId } from "@/contexts/shared-kernel/domain/account-id";
import { ItemName } from "@/contexts/trading/bidding/domain/wanted-item/item-name";

const ACCOUNT_ID = 1;
const OTHER_ACCOUNT_ID = 2;
const ITEM_NAME = "AWP | Asiimov (Field-Tested)";

const asiimov = (accountId: number, maxFor = "-3") =>
    buildWantedItem({ accountId, name: ITEM_NAME, maxFor: maxForPercentage(maxFor) });

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

    it("Should keep the wanted item as a record in the shared store", async () => {
        const repository = container.get(WANTED_ITEM_REPOSITORY);

        await repository.save(asiimov(ACCOUNT_ID));

        expect(container.get(WANTED_ITEM_STORE).find(ACCOUNT_ID, ITEM_NAME)).toEqual(
            asiimov(ACCOUNT_ID).toPrimitives(),
        );
    });

    it("Should find a wanted item put in the shared store", async () => {
        container.get(WANTED_ITEM_STORE).put({ ...asiimov(ACCOUNT_ID).toPrimitives(), enabled: false });

        const wantedItem = await container
            .get(WANTED_ITEM_REPOSITORY)
            .findByName(new AccountId(ACCOUNT_ID), new ItemName(ITEM_NAME));

        expect(wantedItem?.isEnabled()).toBe(false);
    });
});
