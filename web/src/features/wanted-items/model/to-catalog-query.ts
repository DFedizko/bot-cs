export const MIN_CATALOG_QUERY_LENGTH = 2;

export const toCatalogQuery = (text: string): string | null => {
    const query = text.trim();
    return query.length >= MIN_CATALOG_QUERY_LENGTH ? query : null;
};
