import type { Container } from "inversify";
import { maxForPercentage } from "@/contexts/trading/bidding/domain/wanted-item/__builders__/max-for.builder";
import { testContainer } from "@/__builders__/test-container.builder";
import { QUERY_BUS } from "@/packages/external/di/packages.identifiers";
import { DEFAULT_PAGE_SIZE, FIRST_PAGE } from "@/packages/building-blocks/pagination";
import { ListWantedItemsQuery } from "@/contexts/trading/bidding/application/list-wanted-items/list-wanted-items.query";
import {
    LIST_WANTED_ITEMS_HANDLER,
    WANTED_ITEMS_DAO,
} from "@/contexts/trading/bidding/external/di/bidding.identifiers";

const ACCOUNT_ID = 1;
const PAGE = 2;
const PAGE_SIZE = 5;

const ASIIMOV_PAGE = {
    items: [
        {
            name: "AWP | Asiimov (Field-Tested)",
            maxFor: maxForPercentage("-3"),
            criteria: [],
            enabled: true,
            addedAt: "2026-11-20T14:03:00.000Z",
            catalog: null,
        },
    ],
    page: FIRST_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 1,
    counts: { all: 1, enabled: 1, disabled: 0 },
};

let container: Container;

describe("ListWantedItemsQueryHandler", () => {
    beforeEach(() => {
        container = testContainer();
    });

    it("Should answer with the page the DAO reads", async () => {
        jest.spyOn(container.get(WANTED_ITEMS_DAO), "list").mockResolvedValue(ASIIMOV_PAGE);

        const response = await container
            .get(LIST_WANTED_ITEMS_HANDLER)
            .handle(new ListWantedItemsQuery({ accountId: ACCOUNT_ID }));

        expect(response).toEqual(ASIIMOV_PAGE);
    });

    it("Should read the first page of every item of the account, newest first, when nothing else is asked", async () => {
        const listSpy = jest.spyOn(container.get(WANTED_ITEMS_DAO), "list").mockResolvedValue(ASIIMOV_PAGE);

        await container.get(LIST_WANTED_ITEMS_HANDLER).handle(new ListWantedItemsQuery({ accountId: ACCOUNT_ID }));

        expect(listSpy).toHaveBeenCalledWith(
            { accountId: ACCOUNT_ID, filters: undefined, sort: "recent" },
            { page: FIRST_PAGE, pageSize: DEFAULT_PAGE_SIZE },
        );
    });

    it("Should read the asked page of the items with the asked filters and sort", async () => {
        const listSpy = jest.spyOn(container.get(WANTED_ITEMS_DAO), "list").mockResolvedValue(ASIIMOV_PAGE);
        const query = new ListWantedItemsQuery({
            accountId: ACCOUNT_ID,
            page: PAGE,
            pageSize: PAGE_SIZE,
            sort: "name-desc",
            filters: { enabled: false },
        });

        await container.get(LIST_WANTED_ITEMS_HANDLER).handle(query);

        expect(listSpy).toHaveBeenCalledWith(
            { accountId: ACCOUNT_ID, filters: { enabled: false }, sort: "name-desc" },
            { page: PAGE, pageSize: PAGE_SIZE },
        );
    });

    it("Should be asked through the query bus", async () => {
        jest.spyOn(container.get(WANTED_ITEMS_DAO), "list").mockResolvedValue(ASIIMOV_PAGE);

        const response = await container.get(QUERY_BUS).ask(new ListWantedItemsQuery({ accountId: ACCOUNT_ID }));

        expect(response).toEqual(ASIIMOV_PAGE);
    });
});
