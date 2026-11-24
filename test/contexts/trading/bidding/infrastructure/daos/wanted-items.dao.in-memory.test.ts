import type { Container } from "inversify";
import { WearName } from "@/contexts/shared-kernel/domain/wear-name";
import {
    maxForPercentage,
    maxForValue,
} from "@/contexts/trading/bidding/domain/wanted-item/__builders__/max-for.builder";
import { testContainer } from "@/__builders__/test-container.builder";
import { ItemCriterionType } from "@/contexts/trading/bidding/domain/wanted-item/criteria/item-criterion";
import { WantedItem } from "@/contexts/trading/bidding/domain/wanted-item/wanted-item";
import {
    WANTED_ITEM_REPOSITORY,
    WANTED_ITEM_STORE,
    WANTED_ITEMS_DAO,
} from "@/contexts/trading/bidding/external/di/bidding.identifiers";

const ACCOUNT_ID = 1;
const OTHER_ACCOUNT_ID = 2;
const MAX_VALUE = 19400;
const FIRST_PAGE = { page: 1, pageSize: 2 };
const SECOND_PAGE = { page: 2, pageSize: 2 };
const THREE_PER_PAGE = { page: 1, pageSize: 3 };
const FIELD_TESTED = { type: ItemCriterionType.IS_WEAR, value: WearName.FIELD_TESTED };
const ASIIMOV = "AWP | Asiimov (Field-Tested)";
const REDLINE = "AK-47 | Redline (Field-Tested)";
const VULCAN = "AK-47 | Vulcan (Field-Tested)";

const record = (name: string, enabled = true, accountId = ACCOUNT_ID) => ({
    accountId,
    name,
    maxFor: maxForPercentage("-3"),
    criteria: [FIELD_TESTED],
    enabled,
});

const dto = (name: string, enabled = true) => ({
    name,
    maxFor: maxForPercentage("-3"),
    criteria: [FIELD_TESTED],
    enabled,
});

const putAll = (container: Container, records: ReturnType<typeof record>[]) =>
    records.forEach((wanted) => container.get(WANTED_ITEM_STORE).put(wanted));

let container: Container;

describe("WantedItemsDaoInMemory", () => {
    beforeEach(() => {
        container = testContainer();
    });

    it("Should list the wanted items of the account as DTOs", async () => {
        putAll(container, [record(ASIIMOV), record(REDLINE, false, OTHER_ACCOUNT_ID)]);

        const page = await container.get(WANTED_ITEMS_DAO).list({ accountId: ACCOUNT_ID }, FIRST_PAGE);

        expect(page).toEqual({ items: [dto(ASIIMOV)], ...FIRST_PAGE, total: 1 });
    });

    it("Should list only the items with the asked enabled state", async () => {
        putAll(container, [record(ASIIMOV), record(REDLINE, false), record(VULCAN)]);

        const page = await container
            .get(WANTED_ITEMS_DAO)
            .list({ accountId: ACCOUNT_ID, filters: { enabled: false } }, FIRST_PAGE);

        expect(page).toEqual({ items: [dto(REDLINE, false)], ...FIRST_PAGE, total: 1 });
    });

    it("Should keep the order the items were added in when no sort is asked", async () => {
        putAll(container, [record(VULCAN), record(ASIIMOV), record(REDLINE)]);

        const page = await container.get(WANTED_ITEMS_DAO).list({ accountId: ACCOUNT_ID }, THREE_PER_PAGE);

        expect(page.items.map(({ name }) => name)).toEqual([VULCAN, ASIIMOV, REDLINE]);
    });

    it("Should sort the items by name when asked", async () => {
        putAll(container, [record(VULCAN), record(ASIIMOV), record(REDLINE)]);

        const page = await container
            .get(WANTED_ITEMS_DAO)
            .list({ accountId: ACCOUNT_ID, sort: "name" }, THREE_PER_PAGE);

        expect(page.items.map(({ name }) => name)).toEqual([REDLINE, VULCAN, ASIIMOV]);
    });

    it("Should sort before it cuts the page", async () => {
        putAll(container, [record(VULCAN), record(ASIIMOV), record(REDLINE)]);

        const page = await container.get(WANTED_ITEMS_DAO).list({ accountId: ACCOUNT_ID, sort: "name" }, SECOND_PAGE);

        expect(page.items.map(({ name }) => name)).toEqual([ASIIMOV]);
    });

    it("Should return the asked page and count every matching item", async () => {
        putAll(container, [record(ASIIMOV), record(REDLINE), record(VULCAN)]);

        const page = await container.get(WANTED_ITEMS_DAO).list({ accountId: ACCOUNT_ID }, SECOND_PAGE);

        expect(page).toEqual({ items: [dto(VULCAN)], ...SECOND_PAGE, total: 3 });
    });

    it("Should list nothing for an account that wants nothing", async () => {
        const page = await container.get(WANTED_ITEMS_DAO).list({ accountId: ACCOUNT_ID }, FIRST_PAGE);

        expect(page).toEqual({ items: [], ...FIRST_PAGE, total: 0 });
    });

    it("Should list a wanted item saved through the repository", async () => {
        const asiimov = WantedItem.create({ accountId: ACCOUNT_ID, name: ASIIMOV, maxFor: maxForValue(MAX_VALUE) });
        await container.get(WANTED_ITEM_REPOSITORY).save(asiimov);

        const page = await container.get(WANTED_ITEMS_DAO).list({ accountId: ACCOUNT_ID }, FIRST_PAGE);

        expect(page.items).toEqual([{ name: ASIIMOV, maxFor: maxForValue(MAX_VALUE), criteria: [], enabled: true }]);
    });

    it("Should not let a caller change the stored item through its DTO", async () => {
        putAll(container, [record(ASIIMOV)]);
        const dao = container.get(WANTED_ITEMS_DAO);
        const { items } = await dao.list({ accountId: ACCOUNT_ID }, FIRST_PAGE);

        items.forEach((item) => item.criteria.pop());

        expect((await dao.list({ accountId: ACCOUNT_ID }, FIRST_PAGE)).items).toEqual([dto(ASIIMOV)]);
    });
});
