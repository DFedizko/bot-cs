import { SaleOfferAcceptedEvent } from "@/contexts/shared-kernel/events/sale-offer-accepted.event";
import { IntegrationEvent } from "@/packages/building-blocks/integration-event";
import { saleOfferIdentity } from "./__mocks__/sale-events.mock";

describe("SaleOfferAcceptedEvent", () => {
    it("Should be named sale_offer_accepted", () => {
        const event = new SaleOfferAcceptedEvent(saleOfferIdentity());

        expect(event.name).toBe("sale_offer_accepted");
    });

    it("Should carry the accepted Steam offer of the sale", () => {
        const event = new SaleOfferAcceptedEvent(saleOfferIdentity());

        expect(event.payload).toEqual(saleOfferIdentity());
    });

    it("Should be an integration event", () => {
        const event = new SaleOfferAcceptedEvent(saleOfferIdentity());

        expect(event).toBeInstanceOf(IntegrationEvent);
    });

    it("Should freeze its payload", () => {
        const event = new SaleOfferAcceptedEvent(saleOfferIdentity());

        expect(Object.isFrozen(event.payload)).toBe(true);
    });
});
