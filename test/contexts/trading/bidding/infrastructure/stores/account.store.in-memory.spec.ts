import { AccountStoreInMemory } from "@/contexts/trading/bidding/infrastructure/stores/account.store.in-memory";

const MAIN_ID = 6528461;
const ALT_ID = 7104022;

const record = (id: number, name: string) => ({
    id,
    name,
    totalAmount: 1248036,
    reservations: { 288767047: 17149 },
    balance: { total: 1248036, reserved: 17149, available: 1230887 },
});

describe("AccountStoreInMemory", () => {
    it("Should find a record by id", () => {
        const store = new AccountStoreInMemory();
        store.put(record(MAIN_ID, "Empire main"));

        const found = store.find(MAIN_ID);

        expect(found).toEqual(record(MAIN_ID, "Empire main"));
    });

    it("Should find nothing for an unknown id", () => {
        const store = new AccountStoreInMemory();

        const found = store.find(MAIN_ID);

        expect(found).toBeUndefined();
    });

    it("Should list every record in the order they were first put", () => {
        const store = new AccountStoreInMemory();
        store.put(record(MAIN_ID, "Empire main"));
        store.put(record(ALT_ID, "Empire alt"));
        store.put(record(MAIN_ID, "Empire main renamed"));

        const records = store.list();

        expect(records).toEqual([record(MAIN_ID, "Empire main renamed"), record(ALT_ID, "Empire alt")]);
    });
});
