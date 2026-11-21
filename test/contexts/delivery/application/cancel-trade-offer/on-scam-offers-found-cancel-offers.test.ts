import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { COMMAND_BUS, EVENT_BUS, LOGGER } from "@/packages/external/di/packages.identifiers";
import { ON_SCAM_OFFERS_FOUND } from "@/contexts/delivery/external/di/delivery.identifiers";
import { CancelTradeOfferCommand } from "@/contexts/delivery/application/cancel-trade-offer/cancel-trade-offer.command";
import { DeliveryStepFailedEvent } from "@/contexts/delivery/application/delivery-step-failed.event";
import { ACCOUNT_ID, TRADE_ID } from "@/contexts/delivery/domain/__builders__/delivery.builder";
import { OTHER_OFFER_ID } from "../../external/steam/__mocks__/steam-trade-offer.mock";
import { SCAM_REASONS, SECOND_SCAM_OFFER_ID, scamOffersFoundEvent } from "../__mocks__/delivery-events.mock";

const DISPATCH_FAILED = "HTTP error 500";
const ONE_AT_A_TIME = 1;

const cancelCommand = (offerId: string) =>
    new CancelTradeOfferCommand({ tradeId: TRADE_ID, accountId: ACCOUNT_ID, offerId, reasons: SCAM_REASONS });

let container: Container;

describe("OnScamOffersFoundCancelOffers", () => {
    beforeEach(() => {
        container = testContainer();
        jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});
    });

    it("Should cancel every scam offer", async () => {
        const dispatchSpy = jest.spyOn(await container.getAsync(COMMAND_BUS), "dispatch").mockResolvedValue();

        await container.get(ON_SCAM_OFFERS_FOUND).on(scamOffersFoundEvent());

        expect(dispatchSpy.mock.calls).toEqual([
            [cancelCommand(OTHER_OFFER_ID)],
            [cancelCommand(SECOND_SCAM_OFFER_ID)],
        ]);
    });

    it("Should cancel the offers one after another, to respect Steam's rate limits", async () => {
        const running = { now: 0, most: 0 };
        jest.spyOn(await container.getAsync(COMMAND_BUS), "dispatch").mockImplementation(async () => {
            running.now += 1;
            running.most = Math.max(running.most, running.now);
            await Promise.resolve();
            running.now -= 1;
        });

        await container.get(ON_SCAM_OFFERS_FOUND).on(scamOffersFoundEvent());

        expect(running.most).toBe(ONE_AT_A_TIME);
    });

    it("Should keep cancelling the next offers when one cancel fails", async () => {
        const dispatchSpy = jest
            .spyOn(await container.getAsync(COMMAND_BUS), "dispatch")
            .mockRejectedValueOnce(new Error(DISPATCH_FAILED))
            .mockResolvedValue();

        await container.get(ON_SCAM_OFFERS_FOUND).on(scamOffersFoundEvent());

        expect(dispatchSpy).toHaveBeenCalledWith(cancelCommand(SECOND_SCAM_OFFER_ID));
    });

    it("Should report a cancel that failed", async () => {
        jest.spyOn(await container.getAsync(COMMAND_BUS), "dispatch").mockRejectedValue(new Error(DISPATCH_FAILED));
        const publishSpy = jest.spyOn(container.get(EVENT_BUS), "publish");

        await container.get(ON_SCAM_OFFERS_FOUND).on(scamOffersFoundEvent());

        expect(publishSpy).toHaveBeenCalledWith([
            expect.objectContaining({
                name: DeliveryStepFailedEvent.EVENT_NAME,
                payload: { tradeId: TRADE_ID, step: CancelTradeOfferCommand.COMMAND_NAME, reason: DISPATCH_FAILED },
            }),
        ]);
    });
});
