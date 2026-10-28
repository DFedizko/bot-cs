import type { AccountBalance } from "../domain/value-objects/account-balance";

// TODO: support multiple accounts
export interface AccountBalanceStore {
    sync({ total, reserved }: { total: number; reserved?: number }): void;
    reserve(amount: number): void;
	credit(amount: number): void;
	debit(amount: number): void;
    refund(amount: number): void;
    getBalance(): AccountBalance;
}
