import type { WantedItemPrimitives } from "../../domain/wanted-item/wanted-item";

export type WantedItemRecord = WantedItemPrimitives;

export class WantedItemStoreInMemory {
    private readonly byAccount = new Map<number, Map<string, WantedItemRecord>>();

    find(accountId: number, name: string): WantedItemRecord | undefined {
        return this.byAccount.get(accountId)?.get(name);
    }

    listOf(accountId: number): WantedItemRecord[] {
        return [...(this.byAccount.get(accountId)?.values() ?? [])];
    }

    put(record: WantedItemRecord): void {
        this.recordsOf(record.accountId).set(record.name, record);
    }

    remove(accountId: number, name: string): void {
        this.byAccount.get(accountId)?.delete(name);
    }

    private recordsOf(accountId: number): Map<string, WantedItemRecord> {
        const records = this.byAccount.get(accountId) ?? new Map<string, WantedItemRecord>();
        this.byAccount.set(accountId, records);
        return records;
    }
}
