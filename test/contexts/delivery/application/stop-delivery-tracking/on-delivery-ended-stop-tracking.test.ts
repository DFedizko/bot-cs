import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { COMMAND_BUS, EVENT_LISTENER } from "@/packages/external/di/packages.identifiers";
import { StopDeliveryTrackingCommand } from "@/contexts/delivery/application/stop-delivery-tracking/stop-delivery-tracking.command";
import { OnDeliveryEndedStopTracking } from "@/contexts/delivery/application/stop-delivery-tracking/on-delivery-ended-stop-tracking";
import { ACCOUNT_ID, TRADE_ID } from "@/contexts/delivery/domain/__builders__/delivery.builder";
import { DELIVERY_ENDING_EVENTS, deliveryEndedEvent } from "../__mocks__/delivery-ended-events.mock";

const stopListenerFor = async (container: Container, eventName: string) =>
    (await container.getAllAsync(EVENT_LISTENER)).find(
        (listener) => listener instanceof OnDeliveryEndedStopTracking && listener.subscribedTo() === eventName,
    );

let container: Container;

describe.each(DELIVERY_ENDING_EVENTS)("OnDeliveryEndedStopTracking on %s", (eventName) => {
    beforeEach(() => {
        container = testContainer();
    });

    it("Should stop tracking the delivery", async () => {
        const dispatchSpy = jest.spyOn(await container.getAsync(COMMAND_BUS), "dispatch").mockResolvedValue();
        const listener = await stopListenerFor(container, eventName);

        await listener?.on(deliveryEndedEvent(eventName));

        expect(dispatchSpy).toHaveBeenCalledWith(
            new StopDeliveryTrackingCommand({ tradeId: TRADE_ID, accountId: ACCOUNT_ID, reason: eventName }),
        );
    });
});
