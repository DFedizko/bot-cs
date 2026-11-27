import type { CsgDepositWsClient } from "@/contexts/trading/deposit/infrastructure/ws/csgoempire/csg-deposit.ws-client";

type Handler = (data: unknown) => unknown;

export const DEPOSITOR_ACCOUNT_ID = 303119;

export class CsgDepositWsClientFakeAdapter implements CsgDepositWsClient {
    private readonly handlers = new Map<string, Handler[]>();

    constructor(readonly accountId: number = DEPOSITOR_ACCOUNT_ID) {}

    on<T = unknown>(event: string, callback: (data: T) => void): void {
        this.handlers.set(event, [...(this.handlers.get(event) ?? []), callback as Handler]);
    }

    async receive(event: string, data: unknown): Promise<void> {
        await Promise.all((this.handlers.get(event) ?? []).map((handler) => handler(data)));
    }
}
