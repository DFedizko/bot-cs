const MIN_PAGES = 1;

export const countPages = (total: number, pageSize: number) => Math.max(MIN_PAGES, Math.ceil(total / pageSize));
