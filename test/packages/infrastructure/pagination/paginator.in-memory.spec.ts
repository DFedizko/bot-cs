import { PaginatorInMemory } from "@/packages/infrastructure/pagination/paginator.in-memory";

const LETTERS = ["a", "b", "c", "d", "e"];
const PAGE_SIZE = 2;

describe("PaginatorInMemory", () => {
    it("Should return the items of the requested page", () => {
        const page = PaginatorInMemory.paginate(LETTERS, { page: 2, pageSize: PAGE_SIZE });

        expect(page.items).toEqual(["c", "d"]);
    });

    it("Should return the last page with the items left", () => {
        const page = PaginatorInMemory.paginate(LETTERS, { page: 3, pageSize: PAGE_SIZE });

        expect(page.items).toEqual(["e"]);
    });

    it("Should return no items past the last page", () => {
        const page = PaginatorInMemory.paginate(LETTERS, { page: 4, pageSize: PAGE_SIZE });

        expect(page.items).toEqual([]);
    });

    it("Should count every item and echo the pagination", () => {
        const page = PaginatorInMemory.paginate(LETTERS, { page: 1, pageSize: PAGE_SIZE });

        expect(page).toEqual({ items: ["a", "b"], page: 1, pageSize: PAGE_SIZE, total: LETTERS.length });
    });
});
