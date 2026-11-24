import { maxForPercentage } from "@/contexts/trading/bidding/domain/wanted-item/__builders__/max-for.builder";
import { WantedItemStoreInMemory } from "@/contexts/trading/bidding/infrastructure/stores/wanted-item.store.in-memory";

const ACCOUNT_ID = 1;
const OTHER_ACCOUNT_ID = 2;
const ASIIMOV_NAME = "AWP | Asiimov (Field-Tested)";
const REDLINE_NAME = "AK-47 | Redline (Field-Tested)";

const record = (accountId: number, name: string) => ({
    accountId,
    name,
    maxFor: maxForPercentage("-3"),
    criteria: [],
    enabled: true,
});

describe("WantedItemStoreInMemory", () => {
    it("Should find a record by account and name", () => {
        const store = new WantedItemStoreInMemory();
        store.put(record(ACCOUNT_ID, ASIIMOV_NAME));

        const found = store.find(ACCOUNT_ID, ASIIMOV_NAME);

        expect(found).toEqual(record(ACCOUNT_ID, ASIIMOV_NAME));
    });

    it("Should not find the record of another account", () => {
        const store = new WantedItemStoreInMemory();
        store.put(record(ACCOUNT_ID, ASIIMOV_NAME));

        const found = store.find(OTHER_ACCOUNT_ID, ASIIMOV_NAME);

        expect(found).toBeUndefined();
    });

    it("Should replace the record with the same account and name", () => {
        const store = new WantedItemStoreInMemory();
        store.put(record(ACCOUNT_ID, ASIIMOV_NAME));

        store.put({ ...record(ACCOUNT_ID, ASIIMOV_NAME), enabled: false });

        expect(store.listOf(ACCOUNT_ID)).toEqual([{ ...record(ACCOUNT_ID, ASIIMOV_NAME), enabled: false }]);
    });

    it("Should list only the records of the account, in the order they were added", () => {
        const store = new WantedItemStoreInMemory();
        store.put(record(ACCOUNT_ID, REDLINE_NAME));
        store.put(record(OTHER_ACCOUNT_ID, ASIIMOV_NAME));
        store.put(record(ACCOUNT_ID, ASIIMOV_NAME));

        const records = store.listOf(ACCOUNT_ID);

        expect(records).toEqual([record(ACCOUNT_ID, REDLINE_NAME), record(ACCOUNT_ID, ASIIMOV_NAME)]);
    });

    it("Should list nothing for an account with no records", () => {
        const store = new WantedItemStoreInMemory();

        const records = store.listOf(ACCOUNT_ID);

        expect(records).toEqual([]);
    });

    it("Should remove only the record of the account", () => {
        const store = new WantedItemStoreInMemory();
        store.put(record(ACCOUNT_ID, ASIIMOV_NAME));
        store.put(record(OTHER_ACCOUNT_ID, ASIIMOV_NAME));

        store.remove(ACCOUNT_ID, ASIIMOV_NAME);

        expect([store.listOf(ACCOUNT_ID), store.listOf(OTHER_ACCOUNT_ID)]).toEqual([
            [],
            [record(OTHER_ACCOUNT_ID, ASIIMOV_NAME)],
        ]);
    });
});
