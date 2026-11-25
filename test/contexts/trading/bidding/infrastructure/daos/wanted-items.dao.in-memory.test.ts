import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { maxForValue } from "@/contexts/trading/bidding/domain/wanted-item/__builders__/max-for.builder";
import { buildWantedItem } from "@/contexts/trading/bidding/domain/wanted-item/__builders__/wanted-item.builder";
import type { WantedItemRecord } from "@/contexts/trading/bidding/infrastructure/stores/wanted-item.store.in-memory";
import {
    CATALOG_DETAILS_GATEWAY,
    WANTED_ITEM_REPOSITORY,
    WANTED_ITEM_STORE,
    WANTED_ITEMS_DAO,
} from "@/contexts/trading/bidding/external/di/bidding.identifiers";
import {
    ACCOUNT_ID,
    ADDED_AT_ISO,
    ASIIMOV,
    catalogDetails,
    FIELD_TESTED,
    OTHER_ACCOUNT_ID,
    REDLINE,
    VULCAN,
    wantedItemRecord,
} from "./__mocks__/wanted-item-record.mock";
import { CatalogDetailsGatewayFakeAdapter } from "../gateways/catalog-details.gateway.fake-adapter";

const MAX_VALUE = 19400;
const NEWEST_FIRST = { field: "addedAt", order: "desc" } as const;
const FIRST_PAGE = { page: 1, pageSize: 2 };
const SECOND_PAGE = { page: 2, pageSize: 2 };
const NO_COUNTS = { all: 0, enabled: 0, disabled: 0 };

const record = (name: string, enabled = true, accountId = ACCOUNT_ID) => wantedItemRecord({ name, enabled, accountId });

const dto = (name: string, enabled = true) => ({
    name,
    maxFor: record(name).maxFor,
    criteria: [FIELD_TESTED],
    enabled,
    addedAt: ADDED_AT_ISO,
    catalog: null,
});

const putAll = (container: Container, records: WantedItemRecord[]) =>
    records.forEach((wanted) => container.get(WANTED_ITEM_STORE).put(wanted));

const listOf = (container: Container, criteria = {}, pagination = FIRST_PAGE) =>
    container.get(WANTED_ITEMS_DAO).list({ accountId: ACCOUNT_ID, sort: NEWEST_FIRST, ...criteria }, pagination);

let container: Container;

describe("WantedItemsDaoInMemory", () => {
    beforeEach(() => {
        container = testContainer();
        container.rebind(CATALOG_DETAILS_GATEWAY).toConstantValue(new CatalogDetailsGatewayFakeAdapter());
    });

    it("Should list the wanted items of the account as DTOs", async () => {
        putAll(container, [record(ASIIMOV), record(REDLINE, false, OTHER_ACCOUNT_ID)]);

        const page = await listOf(container);

        expect(page).toEqual({
            items: [dto(ASIIMOV)],
            ...FIRST_PAGE,
            total: 1,
            counts: { all: 1, enabled: 1, disabled: 0 },
        });
    });

    it("Should list only the items with the asked enabled state", async () => {
        putAll(container, [record(ASIIMOV), record(REDLINE, false), record(VULCAN)]);

        const page = await listOf(container, { filters: { enabled: false } });

        expect(page.items).toEqual([dto(REDLINE, false)]);
    });

    it("Should count every item of the account whatever the filter and the page", async () => {
        putAll(container, [record(ASIIMOV), record(REDLINE, false), record(VULCAN)]);

        const page = await listOf(container, { filters: { enabled: false } }, SECOND_PAGE);

        expect(page.counts).toEqual({ all: 3, enabled: 2, disabled: 1 });
    });

    it("Should not count the items of another account", async () => {
        putAll(container, [record(ASIIMOV, true, OTHER_ACCOUNT_ID), record(REDLINE, false, OTHER_ACCOUNT_ID)]);

        const page = await listOf(container);

        expect(page.counts).toEqual(NO_COUNTS);
    });

    it("Should return the asked page and count every matching item", async () => {
        putAll(container, [record(ASIIMOV), record(REDLINE), record(VULCAN)]);

        const page = await listOf(container, {}, SECOND_PAGE);

        expect(page).toMatchObject({ items: [dto(ASIIMOV)], ...SECOND_PAGE, total: 3 });
    });

    it("Should list nothing for an account that wants nothing", async () => {
        const page = await listOf(container);

        expect(page).toEqual({ items: [], ...FIRST_PAGE, total: 0, counts: NO_COUNTS });
    });

    it("Should list a wanted item saved through the repository", async () => {
        const asiimov = buildWantedItem({ accountId: ACCOUNT_ID, name: ASIIMOV, maxFor: maxForValue(MAX_VALUE) });
        await container.get(WANTED_ITEM_REPOSITORY).save(asiimov);

        const page = await listOf(container);

        expect(page.items).toEqual([{ ...dto(ASIIMOV), maxFor: maxForValue(MAX_VALUE), criteria: [] }]);
    });

    it("Should give no catalog details when the catalog doesn't know the item", async () => {
        putAll(container, [record(ASIIMOV)]);

        const page = await listOf(container);

        expect(page.items.map(({ catalog }) => catalog)).toEqual([null]);
    });

    it("Should give the catalog details the catalog knows of the item", async () => {
        container
            .rebind(CATALOG_DETAILS_GATEWAY)
            .toConstantValue(new CatalogDetailsGatewayFakeAdapter(new Map([[ASIIMOV, catalogDetails()]])));
        putAll(container, [record(ASIIMOV), record(REDLINE)]);

        const page = await listOf(container);

        expect(page.items.map(({ catalog }) => catalog)).toEqual([null, catalogDetails()]);
    });

    it("Should look up the catalog details of the account's items by their names", async () => {
        const findSpy = jest.spyOn(container.get(CATALOG_DETAILS_GATEWAY), "findByNames");
        putAll(container, [record(ASIIMOV), record(REDLINE)]);

        await listOf(container);

        expect(findSpy).toHaveBeenCalledWith([ASIIMOV, REDLINE]);
    });

    it("Should not let a caller change the stored item through its DTO", async () => {
        putAll(container, [record(ASIIMOV)]);
        const { items } = await listOf(container);

        items.forEach((item) => item.criteria.pop());

        expect((await listOf(container)).items).toEqual([dto(ASIIMOV)]);
    });
});
