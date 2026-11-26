export type PageListEntry = number | "gap";

const FIRST_PAGE = 1;
const MAX_ENTRIES = 7;
const EDGE_RUN = 5;
const NEIGHBOURS = 1;

const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, index) => from + index);

export function buildPageList(current: number, pageCount: number): Array<PageListEntry> {
    if (pageCount <= MAX_ENTRIES) return range(FIRST_PAGE, pageCount);
    if (current < EDGE_RUN) return [...range(FIRST_PAGE, EDGE_RUN), "gap", pageCount];
    if (current > pageCount - EDGE_RUN + FIRST_PAGE)
        return [FIRST_PAGE, "gap", ...range(pageCount - EDGE_RUN + FIRST_PAGE, pageCount)];
    return [FIRST_PAGE, "gap", ...range(current - NEIGHBOURS, current + NEIGHBOURS), "gap", pageCount];
}
