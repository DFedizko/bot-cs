import type { CsgDeliveryWsClient } from "@/contexts/delivery/infrastructure/ws/csgoempire/csg-delivery.ws-client";
import { ACCOUNT_ID } from "@/contexts/delivery/domain/__builders__/delivery.builder";

type Handler = (data: unknown) => void;

export class CsgDeliveryWsClientFakeAdapter implements CsgDeliveryWsClient {
    private readonly handlers = new Map<string, Handler[]>();

    constructor(readonly accountId: number = ACCOUNT_ID) {}

    on<T = unknown>(event: string, callback: (data: T) => void): void {
        this.handlers.set(event, [...(this.handlers.get(event) ?? []), callback as Handler]);
    }

    async receive(event: string, data: unknown): Promise<void> {
        await Promise.all((this.handlers.get(event) ?? []).map((handler) => handler(data)));
    }
}
