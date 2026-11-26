import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { Rarity } from "@/contexts/shared-kernel/domain/rarity";
import {
    maxForPercentage,
    maxForValue,
} from "@/contexts/trading/bidding/domain/wanted-item/__builders__/max-for.builder";
import { ADDED_AT } from "@/contexts/trading/bidding/domain/wanted-item/__builders__/wanted-item.builder";
import type { WantedItemsSortField } from "@/contexts/trading/bidding/application/list-wanted-items/list-wanted-items.query";
import type { SortOrder } from "@/packages/building-blocks/sort";
import type { WantedItemRecord } from "@/contexts/trading/bidding/infrastructure/stores/wanted-item.store.in-memory";
import {
    CATALOG_DETAILS_GATEWAY,
    WANTED_ITEM_STORE,
    WANTED_ITEMS_DAO,
} from "@/contexts/trading/bidding/external/di/bidding.identifiers";
import {
    ACCOUNT_ID,
    ASIIMOV,
    catalogDetails,
    REDLINE,
    VULCAN,
    wantedItemRecord,
} from "./__mocks__/wanted-item-record.mock";
import { CatalogDetailsGatewayFakeAdapter } from "../gateways/catalog-details.gateway.fake-adapter";

const ONE_MINUTE_MS = 60_000;
const KARAMBIT = "★ Karambit | Doppler (Factory New)";
const KNIFE = "★ Bayonet";
const EVERY_ITEM = { page: 1, pageSize: 10 };
const SECOND_PAGE = { page: 2, pageSize: 2 };

const addedMinutesLater = (name: string, minutes: number) =>
    wantedItemRecord({ name, addedAt: ADDED_AT + minutes * ONE_MINUTE_MS });

const putAll = (container: Container, records: WantedItemRecord[]) =>
    records.forEach((wanted) => container.get(WANTED_ITEM_STORE).put(wanted));

const namesSortedBy = async (
    container: Container,
    field: WantedItemsSortField,
    order: SortOrder,
    pagination = EVERY_ITEM,
) => {
    const page = await container
        .get(WANTED_ITEMS_DAO)
        .list({ accountId: ACCOUNT_ID, sort: { field, order } }, pagination);
    return page.items.map(({ name }) => name);
};

const putMaxes = (container: Container) =>
    putAll(container, [
        wantedItemRecord({ name: ASIIMOV, maxFor: maxForValue(19400) }),
        wantedItemRecord({ name: REDLINE, maxFor: maxForPercentage("10") }),
        wantedItemRecord({ name: VULCAN, maxFor: maxForPercentage("-4.05") }),
        wantedItemRecord({ name: KARAMBIT, maxFor: maxForValue(900) }),
        wantedItemRecord({ name: KNIFE, maxFor: maxForPercentage("-3") }),
    ]);

const stubCatalog = (container: Container) =>
    container.rebind(CATALOG_DETAILS_GATEWAY).toConstantValue(
        new CatalogDetailsGatewayFakeAdapter(
            new Map([
                [ASIIMOV, catalogDetails({ rarity: Rarity.COVERT })],
                [REDLINE, catalogDetails({ rarity: Rarity.CLASSIFIED })],
                [KARAMBIT, catalogDetails({ rarity: Rarity.EXTRAORDINARY })],
                [KNIFE, catalogDetails({ rarity: Rarity.CONTRABAND })],
            ]),
        ),
    );

let container: Container;

describe("WantedItemsDaoInMemory sort", () => {
    beforeEach(() => {
        container = testContainer();
        container.rebind(CATALOG_DETAILS_GATEWAY).toConstantValue(new CatalogDetailsGatewayFakeAdapter());
    });

    it("Should list the newest items first by added time, descending", async () => {
        putAll(container, [addedMinutesLater(VULCAN, 1), addedMinutesLater(ASIIMOV, 3), addedMinutesLater(REDLINE, 2)]);

        const names = await namesSortedBy(container, "addedAt", "desc");

        expect(names).toEqual([ASIIMOV, REDLINE, VULCAN]);
    });

    it("Should list the oldest items first by added time, ascending", async () => {
        putAll(container, [addedMinutesLater(VULCAN, 1), addedMinutesLater(ASIIMOV, 3), addedMinutesLater(REDLINE, 2)]);

        const names = await namesSortedBy(container, "addedAt", "asc");

        expect(names).toEqual([VULCAN, REDLINE, ASIIMOV]);
    });

    it("Should list the last added first among items added at the same time", async () => {
        putAll(container, [addedMinutesLater(VULCAN, 0), addedMinutesLater(ASIIMOV, 0), addedMinutesLater(REDLINE, 0)]);

        const names = await namesSortedBy(container, "addedAt", "desc");

        expect(names).toEqual([REDLINE, ASIIMOV, VULCAN]);
    });

    it("Should sort by name from A to Z, ascending", async () => {
        putAll(container, [addedMinutesLater(VULCAN, 0), addedMinutesLater(ASIIMOV, 0), addedMinutesLater(REDLINE, 0)]);

        const names = await namesSortedBy(container, "name", "asc");

        expect(names).toEqual([REDLINE, VULCAN, ASIIMOV]);
    });

    it("Should sort by name from Z to A, descending", async () => {
        putAll(container, [addedMinutesLater(VULCAN, 0), addedMinutesLater(ASIIMOV, 0), addedMinutesLater(REDLINE, 0)]);

        const names = await namesSortedBy(container, "name", "desc");

        expect(names).toEqual([ASIIMOV, VULCAN, REDLINE]);
    });

    it("Should sort the percentage maxes from lowest to highest, then the fixed values, ascending", async () => {
        putMaxes(container);

        const names = await namesSortedBy(container, "max", "asc");

        expect(names).toEqual([VULCAN, KNIFE, REDLINE, KARAMBIT, ASIIMOV]);
    });

    it("Should reverse the max order, the fixed values from highest to lowest first, descending", async () => {
        putMaxes(container);

        const names = await namesSortedBy(container, "max", "desc");

        expect(names).toEqual([ASIIMOV, KARAMBIT, REDLINE, KNIFE, VULCAN]);
    });

    it("Should sort by rarity from Contraband down, the items without catalog details last, descending", async () => {
        stubCatalog(container);
        putMaxes(container);

        const names = await namesSortedBy(container, "rarity", "desc");

        expect(names).toEqual([KNIFE, KARAMBIT, ASIIMOV, REDLINE, VULCAN]);
    });

    it("Should sort by rarity from the items without catalog details up to Contraband, ascending", async () => {
        stubCatalog(container);
        putMaxes(container);

        const names = await namesSortedBy(container, "rarity", "asc");

        expect(names).toEqual([VULCAN, REDLINE, ASIIMOV, KARAMBIT, KNIFE]);
    });

    it.each(["asc", "desc"] as const)(
        "Should keep the newest first among items of the same rarity, %s",
        async (order) => {
            putAll(container, [
                addedMinutesLater(VULCAN, 1),
                addedMinutesLater(ASIIMOV, 3),
                addedMinutesLater(REDLINE, 2),
            ]);

            const names = await namesSortedBy(container, "rarity", order);

            expect(names).toEqual([ASIIMOV, REDLINE, VULCAN]);
        },
    );

    it("Should sort before it cuts the page", async () => {
        putAll(container, [addedMinutesLater(VULCAN, 0), addedMinutesLater(ASIIMOV, 0), addedMinutesLater(REDLINE, 0)]);

        const names = await namesSortedBy(container, "name", "asc", SECOND_PAGE);

        expect(names).toEqual([ASIIMOV]);
    });
});
