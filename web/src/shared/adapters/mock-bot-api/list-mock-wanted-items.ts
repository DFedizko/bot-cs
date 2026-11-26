import { compareMockWantedItems } from "./compare-mock-wanted-items";
import type { MockWantedItem, MockWantedItemsPage, MockWantedItemsQuery } from "./mock-wanted-item";

const FIRST_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const ENABLED = "true";

const matchesFilter = (query: MockWantedItemsQuery) => (item: MockWantedItem) =>
    query.enabled === undefined || item.enabled === (query.enabled === ENABLED);

const countItems = (items: ReadonlyArray<MockWantedItem>) => {
    const enabled = items.filter((item) => item.enabled).length;
    return { all: items.length, enabled, disabled: items.length - enabled };
};

export function listMockWantedItems(
    items: ReadonlyArray<MockWantedItem>,
    query: MockWantedItemsQuery,
): MockWantedItemsPage {
    const page = Number(query.page ?? FIRST_PAGE);
    const pageSize = Number(query.pageSize ?? DEFAULT_PAGE_SIZE);
    const matching = items.filter(matchesFilter(query)).sort(compareMockWantedItems(query));
    const start = (page - FIRST_PAGE) * pageSize;
    return {
        items: matching.slice(start, start + pageSize),
        page,
        pageSize,
        total: matching.length,
        counts: countItems(items),
    };
}
