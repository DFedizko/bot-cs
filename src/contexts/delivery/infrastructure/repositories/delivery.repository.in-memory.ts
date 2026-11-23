import type { Primitive } from "@/packages/building-blocks/value-object";
import type { DeliveryRepository } from "../../application/delivery.repository";
import type { Delivery } from "../../domain/delivery/delivery";
import { DeliveryNotFoundError } from "../../domain/delivery/errors/delivery-not-found.error";
import type { TradeId } from "../../domain/delivery/trade-id";

export class DeliveryRepositoryInMemory implements DeliveryRepository {
    private readonly store = new Map<Primitive<TradeId>, Delivery>();

    async getByTradeId(tradeId: TradeId): Promise<Delivery> {
        const delivery = await this.findByTradeId(tradeId);
        if (!delivery) throw new DeliveryNotFoundError(tradeId.getValue());
        return delivery;
    }

    async findByTradeId(tradeId: TradeId): Promise<Delivery | undefined> {
        return this.store.get(tradeId.getValue());
    }

    async save(delivery: Delivery): Promise<void> {
        this.store.set(delivery.getTradeId(), delivery);
    }
}
