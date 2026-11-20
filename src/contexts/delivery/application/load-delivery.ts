import type { Delivery } from "../domain/delivery/delivery";
import { DeliveryNotFoundError } from "../domain/delivery/errors/delivery-not-found.error";
import { TradeId } from "../domain/delivery/trade-id";
import type { DeliveryRepository } from "./delivery.repository";

export const loadDelivery = async (repository: DeliveryRepository, tradeId: number): Promise<Delivery> => {
    const delivery = await repository.findByTradeId(new TradeId(tradeId));
    if (!delivery) throw new DeliveryNotFoundError(tradeId);
    return delivery;
};
