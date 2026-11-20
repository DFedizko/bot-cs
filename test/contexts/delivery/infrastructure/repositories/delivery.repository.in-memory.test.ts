import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { DELIVERY_REPOSITORY } from "@/contexts/delivery/external/di/delivery.identifiers";
import { TradeId } from "@/contexts/delivery/domain/delivery/trade-id";
import { delivery, TRADE_ID } from "../../domain/__builders__/delivery.builder";

const UNKNOWN_TRADE_ID = 1;

let container: Container;

describe("DeliveryRepositoryInMemory", () => {
    beforeEach(() => {
        container = testContainer();
    });

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
