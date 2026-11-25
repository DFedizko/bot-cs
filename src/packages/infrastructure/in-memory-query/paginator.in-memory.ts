import type { Paginated } from "@/packages/building-blocks/paginated";
import { FIRST_PAGE, type Pagination } from "@/packages/building-blocks/pagination";

export class PaginatorInMemory {
    static paginate<T>(items: T[], { page, pageSize }: Pagination): Paginated<T> {
        const start = (page - FIRST_PAGE) * pageSize;
        return { items: items.slice(start, start + pageSize), page, pageSize, total: items.length };
    }
}
