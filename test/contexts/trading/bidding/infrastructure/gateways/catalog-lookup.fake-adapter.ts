import type { CatalogItemDto, CatalogLookup, CatalogLookupResponse } from "@/contexts/catalog";

export class CatalogLookupFakeAdapter implements CatalogLookup {
    constructor(private readonly known: readonly CatalogItemDto[] = []) {}

    async findByNames(names: readonly string[]): Promise<CatalogLookupResponse> {
        const items = this.known.filter(({ marketHashName }) => names.includes(marketHashName));
        return { items: items.map((item) => ({ ...item })) };
    }
}
