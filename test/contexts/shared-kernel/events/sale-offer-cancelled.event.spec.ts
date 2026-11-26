import { SaleOfferCancelledEvent } from "@/contexts/shared-kernel/events/sale-offer-cancelled.event";
import { SaleCancellationReason } from "@/contexts/shared-kernel/events/sale-cancellation-reason";
import { IntegrationEvent } from "@/packages/building-blocks/integration-event";
import { saleOfferIdentity } from "./__mocks__/sale-events.mock";

const cancelledOnCsg = () => ({ ...saleOfferIdentity(), reason: SaleCancellationReason.TRADE_CANCELLED_ON_CSG });

describe("SaleOfferCancelledEvent", () => {
    it("Should be named sale_offer_cancelled", () => {
        const event = new SaleOfferCancelledEvent(cancelledOnCsg());

        expect(event.name).toBe("sale_offer_cancelled");
    });

    it("Should carry the cancelled Steam offer of the sale and why it was cancelled", () => {
        const event = new SaleOfferCancelledEvent(cancelledOnCsg());

        expect(event.payload).toEqual(cancelledOnCsg());
    });

    it("Should be an integration event", () => {
        const event = new SaleOfferCancelledEvent(cancelledOnCsg());

        expect(event).toBeInstanceOf(IntegrationEvent);
    });

    it("Should freeze its payload", () => {
        const event = new SaleOfferCancelledEvent(cancelledOnCsg());

        expect(Object.isFrozen(event.payload)).toBe(true);
    });
});
