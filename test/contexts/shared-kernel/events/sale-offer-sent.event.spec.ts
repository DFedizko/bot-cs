import { SaleOfferSentEvent } from "@/contexts/shared-kernel/events/sale-offer-sent.event";
import { IntegrationEvent } from "@/packages/building-blocks/integration-event";
import { saleOfferIdentity } from "./__mocks__/sale-events.mock";

describe("SaleOfferSentEvent", () => {
    it("Should be named sale_offer_sent", () => {
        const event = new SaleOfferSentEvent(saleOfferIdentity());

        expect(event.name).toBe("sale_offer_sent");
    });

    it("Should carry the sale's deposit, account and Steam offer", () => {
        const event = new SaleOfferSentEvent(saleOfferIdentity());

        expect(event.payload).toEqual(saleOfferIdentity());
    });

    it("Should be an integration event", () => {
        const event = new SaleOfferSentEvent(saleOfferIdentity());

        expect(event).toBeInstanceOf(IntegrationEvent);
    });

    it("Should freeze its payload", () => {
        const event = new SaleOfferSentEvent(saleOfferIdentity());

        expect(Object.isFrozen(event.payload)).toBe(true);
    });
});
