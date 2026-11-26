import { ItemSoldEvent } from "@/contexts/shared-kernel/events/item-sold.event";
import { IntegrationEvent } from "@/packages/building-blocks/integration-event";
import { itemSoldPayload } from "./__mocks__/sale-events.mock";

describe("ItemSoldEvent", () => {
    it("Should be named item_sold", () => {
        const event = new ItemSoldEvent(itemSoldPayload());

        expect(event.name).toBe("item_sold");
    });

    it("Should carry the sold item, its buyer and the deadline", () => {
        const event = new ItemSoldEvent(itemSoldPayload());

        expect(event.payload).toEqual(itemSoldPayload());
    });

    it("Should be an integration event", () => {
        const event = new ItemSoldEvent(itemSoldPayload());

        expect(event).toBeInstanceOf(IntegrationEvent);
    });

    it("Should freeze its payload", () => {
        const event = new ItemSoldEvent(itemSoldPayload());

        expect(Object.isFrozen(event.payload)).toBe(true);
    });

    it("Should not change when the given payload changes later", () => {
        const payload = itemSoldPayload();
        const event = new ItemSoldEvent(payload);

        payload.tradeUrl = "https://steamcommunity.com/tradeoffer/new/?partner=1&token=evil";

        expect(event.payload.tradeUrl).toBe(itemSoldPayload().tradeUrl);
    });
});
