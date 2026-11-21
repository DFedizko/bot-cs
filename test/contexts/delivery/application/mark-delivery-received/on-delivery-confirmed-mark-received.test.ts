import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { COMMAND_BUS, EVENT_BUS, LOGGER } from "@/packages/external/di/packages.identifiers";
import { DeliveryStepFailedEvent } from "@/contexts/delivery/application/delivery-step-failed.event";
import { TRADE_ID } from "@/contexts/delivery/domain/__builders__/delivery.builder";
import { ON_DELIVERY_CONFIRMED } from "@/contexts/delivery/external/di/delivery.identifiers";
import { MarkDeliveryReceivedCommand } from "@/contexts/delivery/application/mark-delivery-received/mark-delivery-received.command";
import { deliveryConfirmedEvent } from "../__mocks__/delivery-events.mock";

const DISPATCH_FAILED = "HTTP error 500";

let container: Container;

describe("OnDeliveryConfirmedMarkReceived", () => {
    beforeEach(() => {
        container = testContainer();
    });

    it("Should dispatch the next delivery step", async () => {
        const dispatchSpy = jest.spyOn(await container.getAsync(COMMAND_BUS), "dispatch").mockResolvedValue();

        await container.get(ON_DELIVERY_CONFIRMED).on(deliveryConfirmedEvent());

        expect(dispatchSpy).toHaveBeenCalledWith(
            new MarkDeliveryReceivedCommand(deliveryConfirmedEvent().payload.tradeId),
        );
    });

    it("Should log a failed step instead of crashing the event bus", async () => {
        jest.spyOn(await container.getAsync(COMMAND_BUS), "dispatch").mockRejectedValue(new Error(DISPATCH_FAILED));
        const loggerSpy = jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});

        await container.get(ON_DELIVERY_CONFIRMED).on(deliveryConfirmedEvent());

        expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining(DISPATCH_FAILED));
    });

    it("Should report the failed step so it can be retried", async () => {
        jest.spyOn(await container.getAsync(COMMAND_BUS), "dispatch").mockRejectedValue(new Error(DISPATCH_FAILED));
        jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});
        const publishSpy = jest.spyOn(container.get(EVENT_BUS), "publish");

        await container.get(ON_DELIVERY_CONFIRMED).on(deliveryConfirmedEvent());

        expect(publishSpy).toHaveBeenCalledWith([
            expect.objectContaining({
                name: DeliveryStepFailedEvent.EVENT_NAME,
                payload: { tradeId: TRADE_ID, step: MarkDeliveryReceivedCommand.COMMAND_NAME, reason: DISPATCH_FAILED },
            }),
        ]);
    });
});
