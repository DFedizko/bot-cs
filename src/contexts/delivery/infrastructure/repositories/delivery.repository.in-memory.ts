import type { Primitive } from "@/packages/building-blocks/value-object";
import type { DeliveryRepository } from "../../application/delivery.repository";
import type { Delivery } from "../../domain/delivery/delivery";
import type { TradeId } from "../../domain/delivery/trade-id";

export class DeliveryRepositoryInMemory implements DeliveryRepository {
    private readonly store = new Map<Primitive<TradeId>, Delivery>();

    async findByTradeId(tradeId: TradeId): Promise<Delivery | undefined> {
        return this.store.get(tradeId.getValue());
    }

    async save(delivery: Delivery): Promise<void> {
        this.store.set(delivery.getTradeId(), delivery);
    }
}
