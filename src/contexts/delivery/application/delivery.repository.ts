import type { Delivery } from "../domain/delivery/delivery";
import type { TradeId } from "../domain/delivery/trade-id";

export interface DeliveryRepository {
    findByTradeId(tradeId: TradeId): Promise<Delivery | undefined>;
    save(delivery: Delivery): Promise<void>;
}
