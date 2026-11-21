import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { COMMAND_BUS, EVENT_BUS, LOGGER } from "@/packages/external/di/packages.identifiers";
import { DELIVERY_COMMAND_BUS } from "@/contexts/delivery/external/di/delivery.identifiers";
import { ConfirmTradeOfferCommand } from "@/contexts/delivery/application/confirm-trade-offer/confirm-trade-offer.command";
import { DeliveryStepFailedEvent } from "@/contexts/delivery/application/delivery-step-failed.event";
import { StartDeliveryCommand } from "@/contexts/delivery/application/start-delivery/start-delivery.command";
import { CommandBusStepFailureDecorator } from "@/contexts/delivery/infrastructure/command-bus/command-bus.step-failure-decorator";
import { deliveryProps, TRADE_ID } from "@/contexts/delivery/domain/__builders__/delivery.builder";

const STEAM_DOWN = "HTTP error 429";
const CS_APP_ID = 730;

const confirmStep = () => new ConfirmTradeOfferCommand(TRADE_ID);

const notAStep = () => {
    const { expectedItem, ...props } = deliveryProps();
    return new StartDeliveryCommand({ ...props, ...expectedItem, appId: CS_APP_ID });
};

let container: Container;

describe("CommandBusStepFailureDecorator", () => {
    beforeEach(() => {
        container = testContainer();
        jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});
    });

    it("Should decorate the shared command bus", async () => {
        const bus = await container.getAsync(DELIVERY_COMMAND_BUS);

        expect(bus).toBeInstanceOf(CommandBusStepFailureDecorator);
    });

    it("Should hand the command to the shared command bus", async () => {
        const dispatchSpy = jest.spyOn(await container.getAsync(COMMAND_BUS), "dispatch").mockResolvedValue();

        await (await container.getAsync(DELIVERY_COMMAND_BUS)).dispatch(confirmStep());

        expect(dispatchSpy).toHaveBeenCalledWith(confirmStep());
    });

    it("Should register handlers on the shared command bus", async () => {
        const registerSpy = jest.spyOn(await container.getAsync(COMMAND_BUS), "register").mockImplementation(() => {});
        const handler = { subscribedTo: () => ConfirmTradeOfferCommand.COMMAND_NAME, handle: async () => {} };

        (await container.getAsync(DELIVERY_COMMAND_BUS)).register(handler);

        expect(registerSpy).toHaveBeenCalledWith(handler);
    });

    it("Should not reject when a delivery step fails, so the event bus can't crash", async () => {
        jest.spyOn(await container.getAsync(COMMAND_BUS), "dispatch").mockRejectedValue(new Error(STEAM_DOWN));

        const dispatch = (await container.getAsync(DELIVERY_COMMAND_BUS)).dispatch(confirmStep());

        await expect(dispatch).resolves.toBeUndefined();
    });

    it("Should log the failed step", async () => {
        jest.spyOn(await container.getAsync(COMMAND_BUS), "dispatch").mockRejectedValue(new Error(STEAM_DOWN));
        const loggerSpy = jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});

        await (await container.getAsync(DELIVERY_COMMAND_BUS)).dispatch(confirmStep());

        expect(loggerSpy).toHaveBeenCalledWith(
            `Delivery step "${ConfirmTradeOfferCommand.COMMAND_NAME}" of trade "${TRADE_ID}" failed: ${STEAM_DOWN}`,
        );
    });

    it("Should report the failed step with the trade it belongs to", async () => {
        jest.spyOn(await container.getAsync(COMMAND_BUS), "dispatch").mockRejectedValue(new Error(STEAM_DOWN));
        const publishSpy = jest.spyOn(container.get(EVENT_BUS), "publish");

        await (await container.getAsync(DELIVERY_COMMAND_BUS)).dispatch(confirmStep());

        expect(publishSpy).toHaveBeenCalledWith([
            expect.objectContaining({
                name: DeliveryStepFailedEvent.EVENT_NAME,
                payload: { tradeId: TRADE_ID, step: ConfirmTradeOfferCommand.COMMAND_NAME, reason: STEAM_DOWN },
            }),
        ]);
    });

    it("Should let a command that is not a delivery step fail as usual", async () => {
        jest.spyOn(await container.getAsync(COMMAND_BUS), "dispatch").mockRejectedValue(new Error(STEAM_DOWN));

        const dispatch = (await container.getAsync(DELIVERY_COMMAND_BUS)).dispatch(notAStep());

        await expect(dispatch).rejects.toThrow(STEAM_DOWN);
    });
});
