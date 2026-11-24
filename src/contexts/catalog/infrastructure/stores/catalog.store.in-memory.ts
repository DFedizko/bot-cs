import type { CatalogItemPrimitives } from "../../domain/catalog-item/catalog-item";

export type CatalogItemRecord = CatalogItemPrimitives;

export class CatalogStoreInMemory {
    private records = new Map<string, CatalogItemRecord>();
    private loaded = false;

    replaceAll(records: CatalogItemRecord[]): void {
        const byName = new Map<string, CatalogItemRecord>();
        records.forEach((record) => this.keepFirstOfName(byName, record));
        this.records = byName;
        this.loaded = true;
    }

    isLoaded(): boolean {
        return this.loaded;
    }

    list(): readonly CatalogItemRecord[] {
        return [...this.records.values()];
    }

    private keepFirstOfName(byName: Map<string, CatalogItemRecord>, record: CatalogItemRecord): void {
        if (!byName.has(record.marketHashName)) byName.set(record.marketHashName, record);
    }
}
