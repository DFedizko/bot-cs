import type { AccountPrimitives } from "../../domain/account/account";

export type AccountBalanceRecord = {
    total: number;
    reserved: number;
    available: number;
};

export type AccountRecord = AccountPrimitives & {
    balance: AccountBalanceRecord;
};

export class AccountStoreInMemory {
    private readonly records = new Map<number, AccountRecord>();

    find(id: number): AccountRecord | undefined {
        return this.records.get(id);
    }

    list(): AccountRecord[] {
        return [...this.records.values()];
    }

    put(record: AccountRecord): void {
        this.records.set(record.id, record);
    }
}
