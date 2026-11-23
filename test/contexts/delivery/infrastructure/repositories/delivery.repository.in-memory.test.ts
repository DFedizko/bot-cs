import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { DELIVERY_REPOSITORY } from "@/contexts/delivery/external/di/delivery.identifiers";
import { TradeId } from "@/contexts/delivery/domain/delivery/trade-id";
import { DeliveryNotFoundError } from "@/contexts/delivery/domain/delivery/errors/delivery-not-found.error";
import { delivery, TRADE_ID } from "../../domain/__builders__/delivery.builder";

const UNKNOWN_TRADE_ID = 1;

let container: Container;

describe("DeliveryRepositoryInMemory", () => {
    beforeEach(() => {
        container = testContainer();
    });

    describe("getByTradeId", () => {
        it("Should get a saved delivery by its trade id", async () => {
            const repository = container.get(DELIVERY_REPOSITORY);
            const saved = delivery();
            await repository.save(saved);

            const found = await repository.getByTradeId(new TradeId(TRADE_ID));

            expect(found).toBe(saved);
        });

        it("Should throw a delivery not found error for an unknown trade", async () => {
            const getting = container.get(DELIVERY_REPOSITORY).getByTradeId(new TradeId(UNKNOWN_TRADE_ID));

            await expect(getting).rejects.toThrow(new DeliveryNotFoundError(UNKNOWN_TRADE_ID));
        });
    });

    describe("findByTradeId", () => {
        it("Should find a saved delivery by its trade id", async () => {
            const repository = container.get(DELIVERY_REPOSITORY);
            const saved = delivery();
            await repository.save(saved);

            const found = await repository.findByTradeId(new TradeId(TRADE_ID));

            expect(found).toBe(saved);
        });

        it("Should find nothing for an unknown trade", async () => {
            const found = await container.get(DELIVERY_REPOSITORY).findByTradeId(new TradeId(UNKNOWN_TRADE_ID));

            expect(found).toBeUndefined();
        });
    });
});
