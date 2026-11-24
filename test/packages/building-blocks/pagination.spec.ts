import { DEFAULT_PAGE_SIZE, FIRST_PAGE, withDefaultPage } from "@/packages/building-blocks/pagination";

const PAGE = 3;
const PAGE_SIZE = 5;

describe("Pagination", () => {
    it("Should start at the first page with the default page size", () => {
        const pagination = withDefaultPage({});

        expect(pagination).toEqual({ page: FIRST_PAGE, pageSize: DEFAULT_PAGE_SIZE });
    });

    it("Should keep the page and page size given", () => {
        const pagination = withDefaultPage({ page: PAGE, pageSize: PAGE_SIZE });

        expect(pagination).toEqual({ page: PAGE, pageSize: PAGE_SIZE });
    });
});
