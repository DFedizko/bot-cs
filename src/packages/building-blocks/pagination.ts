export type Pagination = {
    readonly page: number;
    readonly pageSize: number;
};

export const FIRST_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const withDefaultPage = ({
    page = FIRST_PAGE,
    pageSize = DEFAULT_PAGE_SIZE,
}: Partial<Pagination>): Pagination => ({
    page,
    pageSize,
});
