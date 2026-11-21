import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { ASYNC_EVENT_BUS, LOGGER } from "@/packages/external/di/packages.identifiers";
import {
    CSG_DELIVERY_HTTP,
    DELIVERY_REPOSITORY,
    DISPUTE_DELIVERY_HANDLER,
} from "@/contexts/delivery/external/di/delivery.identifiers";
import { DisputeDeliveryCommand } from "@/contexts/delivery/application/dispute-delivery/dispute-delivery.command";
import { DeliveryDisputedEvent } from "@/contexts/delivery/domain/delivery/events/delivery-disputed.event";
import { DeliveryStatus } from "@/contexts/delivery/domain/delivery/delivery-status";
import { DeliveryNotFoundError } from "@/contexts/delivery/domain/delivery/errors/delivery-not-found.error";
import { ACCOUNT_ID, awaitingDelivery, TRADE_ID, TRADE_OFFER_ID } from "../../domain/__builders__/delivery.builder";
import { OFFER_ID } from "../../domain/__builders__/received-offer.builder";

let container: Container;

describe("DisputeDeliveryCommandHandler", () => {
    beforeEach(() => {
        container = testContainer();
        jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});
    });

    it("Should dispute the trade on csgoempire", async () => {
        await container.get(DELIVERY_REPOSITORY).save(awaitingDelivery());
        const disputeSpy = jest.spyOn(container.get(CSG_DELIVERY_HTTP), "disputeTrade");

        await container.get(DISPUTE_DELIVERY_HANDLER).handle(new DisputeDeliveryCommand(TRADE_ID));

        expect(disputeSpy).toHaveBeenCalledWith({ tradeoffer_id: TRADE_OFFER_ID });
    });

    it("Should record the dispute on the delivery", async () => {
        const awaiting = awaitingDelivery();
        await container.get(DELIVERY_REPOSITORY).save(awaiting);

        await container.get(DISPUTE_DELIVERY_HANDLER).handle(new DisputeDeliveryCommand(TRADE_ID));

        expect(awaiting.getStatus()).toBe(DeliveryStatus.DISPUTED);
    });

    it("Should publish that the delivery was disputed", async () => {
        await container.get(DELIVERY_REPOSITORY).save(awaitingDelivery());
        const publishSpy = jest.spyOn(container.get(ASYNC_EVENT_BUS), "publish");

        await container.get(DISPUTE_DELIVERY_HANDLER).handle(new DisputeDeliveryCommand(TRADE_ID));

        const [[event]] = publishSpy.mock.calls[0];
        expect(event).toMatchObject({
            name: DeliveryDisputedEvent.EVENT_NAME,
            payload: { tradeId: TRADE_ID, accountId: ACCOUNT_ID },
        });
    });

    it("Should log the dispute", async () => {
        await container.get(DELIVERY_REPOSITORY).save(awaitingDelivery());
        const loggerSpy = jest.spyOn(container.get(LOGGER), "log");

        await container.get(DISPUTE_DELIVERY_HANDLER).handle(new DisputeDeliveryCommand(TRADE_ID));

        expect(loggerSpy).toHaveBeenCalledWith(`Disputed trade "${TRADE_ID}" of account "${ACCOUNT_ID}"`);
    });

    it("Should not dispute a delivery whose offer was already accepted", async () => {
        const accepted = awaitingDelivery();
        accepted.acceptOffer(OFFER_ID, false);
        await container.get(DELIVERY_REPOSITORY).save(accepted);
        const disputeSpy = jest.spyOn(container.get(CSG_DELIVERY_HTTP), "disputeTrade");

        await container.get(DISPUTE_DELIVERY_HANDLER).handle(new DisputeDeliveryCommand(TRADE_ID));

        expect(disputeSpy).not.toHaveBeenCalled();
    });

    it("Should leave the delivery awaiting its offer when csgoempire refuses the dispute", async () => {
        const awaiting = awaitingDelivery();
        await container.get(DELIVERY_REPOSITORY).save(awaiting);
        jest.spyOn(container.get(CSG_DELIVERY_HTTP), "disputeTrade").mockRejectedValue(new Error());

        await expect(
            container.get(DISPUTE_DELIVERY_HANDLER).handle(new DisputeDeliveryCommand(TRADE_ID)),
        ).rejects.toThrow();

        expect(awaiting.getStatus()).toBe(DeliveryStatus.AWAITING_OFFER);
    });

    it("Should fail for an unknown delivery", async () => {
        const dispute = container.get(DISPUTE_DELIVERY_HANDLER).handle(new DisputeDeliveryCommand(TRADE_ID));

        await expect(dispute).rejects.toThrow(DeliveryNotFoundError);
    });
});
