import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { LOGGER } from "@/packages/external/di/packages.identifiers";
import {
    CSG_DELIVERY_HTTP,
    DELIVERY_REPOSITORY,
    DELIVERY_TRACKERS,
    OFFER_ACCEPTANCE_GATEWAY,
    RECEIVED_OFFERS_GATEWAY,
    TRACKING_OPTIONS,
} from "@/contexts/delivery/external/di/delivery.identifiers";
import { DeliveryStatus } from "@/contexts/delivery/domain/delivery/delivery-status";
import { TradeId } from "@/contexts/delivery/domain/delivery/trade-id";
import { TRADE_ID } from "@/contexts/delivery/domain/__builders__/delivery.builder";
import { givenDelivery, steamSession } from "../../application/__builders__/delivery-scenario.builder";
import { awaitingDelivery } from "@/contexts/delivery/domain/__builders__/delivery.builder";
import { OFFER_ID } from "@/contexts/delivery/domain/__builders__/received-offer.builder";
import { CS_APP_ID } from "@/contexts/shared-kernel/domain/cs-app-id";
import { STEAM_OFFER_STATE } from "@/contexts/delivery/infrastructure/steam/steam-trade-offer";
import { steamEconItem, steamTradeOffer } from "../../external/steam/__mocks__/steam-trade-offer.mock";
import {
    fakeClock,
    fakeScheduler,
    SECOND_ACCOUNT_ID,
    SECOND_ASSET_ID,
    SECOND_STEAM_ACCOUNT,
    SECOND_TRADE_ID,
    SECOND_TRADE_OFFER_ID,
    startTracking,
    trackedDelivery,
} from "../../__builders__/tracking.builder";

const SECOND_OFFER_ID = "6745128888";

const givenTwoAccounts = async (container: Container): Promise<void> => {
    const secondOffer = steamTradeOffer({
        id: SECOND_OFFER_ID,
        itemsToReceive: [steamEconItem({ assetid: SECOND_ASSET_ID })],
    });
    await givenDelivery(container, { offers: [steamTradeOffer(), secondOffer] });
    const second = awaitingDelivery({
        tradeId: SECOND_TRADE_ID,
        tradeOfferId: SECOND_TRADE_OFFER_ID,
        accountId: SECOND_ACCOUNT_ID,
        expectedItem: { assetId: SECOND_ASSET_ID, marketName: steamEconItem().market_hash_name, appId: CS_APP_ID },
    });
    await container.get(DELIVERY_REPOSITORY).save(second);
    startTracking(container);
    startTracking(container, trackedDelivery({ tradeId: SECOND_TRADE_ID, accountId: SECOND_ACCOUNT_ID }));
};

const DISPUTE_REFUSED = new Error("HTTP error 400");
const RATE_LIMITED = new Error("HTTP error 429 Too Many Requests");
const CONCURRENT_TICKS = 3;
const ONE_MS = 1;

const statusOf = async (container: Container): Promise<DeliveryStatus | undefined> =>
    (await container.get(DELIVERY_REPOSITORY).findByTradeId(new TradeId(TRADE_ID)))?.getStatus();

let container: Container;

describe("DeliveryTrackersSchedulerAdapter", () => {
    beforeEach(() => {
        container = testContainer();
        jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});
    });

    it("Should check the offers every configured interval", () => {
        startTracking(container);

        expect(fakeScheduler(container).activeIntervals()).toEqual([container.get(TRACKING_OPTIONS).checkIntervalMs]);
    });

    it("Should not check before the first tick", async () => {
        await givenDelivery(container);
        const listSpy = jest.spyOn(container.get(RECEIVED_OFFERS_GATEWAY), "listReceivedActive");

        startTracking(container);

        expect(listSpy).not.toHaveBeenCalled();
    });

    it("Should accept the right offer on a tick", async () => {
        await givenDelivery(container);
        startTracking(container);

        await fakeScheduler(container).tick();

        expect(await statusOf(container)).not.toBe(DeliveryStatus.AWAITING_OFFER);
    });

    it("Should keep checking while the offer has not arrived", async () => {
        await givenDelivery(container, { offers: [] });
        const listSpy = jest.spyOn(container.get(RECEIVED_OFFERS_GATEWAY), "listReceivedActive");
        startTracking(container);
        await fakeScheduler(container).tick();

        await fakeScheduler(container).tick();

        expect(listSpy).toHaveBeenCalledTimes(2);
    });

    it("Should track a delivery only once", () => {
        startTracking(container);

        const trackedAgain = startTracking(container);

        expect([trackedAgain, fakeScheduler(container).activeIntervals().length]).toEqual([false, 1]);
    });

    it("Should stop checking an untracked delivery", () => {
        startTracking(container);

        const untracked = container.get(DELIVERY_TRACKERS).untrack(trackedDelivery());

        expect([untracked, fakeScheduler(container).activeIntervals()]).toEqual([true, []]);
    });

    it("Should tell when the delivery was not tracked", () => {
        const untracked = container.get(DELIVERY_TRACKERS).untrack(trackedDelivery());

        expect(untracked).toBe(false);
    });

    it("Should not check a delivery untracked before its tick ran", async () => {
        await givenDelivery(container);
        const listSpy = jest.spyOn(container.get(RECEIVED_OFFERS_GATEWAY), "listReceivedActive");
        startTracking(container);
        const capturedTick = fakeScheduler(container).captureTick();
        container.get(DELIVERY_TRACKERS).untrack(trackedDelivery());

        await capturedTick();

        expect(listSpy).not.toHaveBeenCalled();
    });

    it("Should never accept twice under concurrent ticks", async () => {
        await givenDelivery(container);
        const acceptSpy = jest.spyOn(container.get(OFFER_ACCEPTANCE_GATEWAY), "accept");
        startTracking(container);

        await fakeScheduler(container).tick(CONCURRENT_TICKS);

        expect(acceptSpy).toHaveBeenCalledTimes(1);
    });

    describe("when the max wait passes", () => {
        it("Should dispute the delivery", async () => {
            await givenDelivery(container, { offers: [] });
            startTracking(container);
            fakeClock(container).advance(container.get(TRACKING_OPTIONS).maxWaitMs);

            await fakeScheduler(container).tick();

            expect(await statusOf(container)).toBe(DeliveryStatus.DISPUTED);
        });

        it("Should stop tracking the delivery", async () => {
            await givenDelivery(container, { offers: [] });
            startTracking(container);
            fakeClock(container).advance(container.get(TRACKING_OPTIONS).maxWaitMs);

            await fakeScheduler(container).tick();

            expect(fakeScheduler(container).activeIntervals()).toEqual([]);
        });

        it("Should stop tracking even when the dispute fails, so it is never retried forever", async () => {
            await givenDelivery(container, { offers: [] });
            jest.spyOn(container.get(CSG_DELIVERY_HTTP), "disputeTrade").mockRejectedValue(DISPUTE_REFUSED);
            startTracking(container);
            fakeClock(container).advance(container.get(TRACKING_OPTIONS).maxWaitMs);

            await fakeScheduler(container).tick();

            expect(fakeScheduler(container).activeIntervals()).toEqual([]);
        });

        it("Should log a failed dispute so it can be done by hand", async () => {
            await givenDelivery(container, { offers: [] });
            jest.spyOn(container.get(CSG_DELIVERY_HTTP), "disputeTrade").mockRejectedValue(DISPUTE_REFUSED);
            const loggerSpy = jest.spyOn(container.get(LOGGER), "log");
            startTracking(container);
            fakeClock(container).advance(container.get(TRACKING_OPTIONS).maxWaitMs);

            await fakeScheduler(container).tick();

            expect(loggerSpy).toHaveBeenCalledWith(
                expect.stringContaining(`Disputing trade "${TRADE_ID}" failed: ${DISPUTE_REFUSED.message}`),
            );
        });

        it("Should count the max wait from when csgoempire sent the trade", async () => {
            await givenDelivery(container, { offers: [] });
            const { maxWaitMs } = container.get(TRACKING_OPTIONS);
            startTracking(container, trackedDelivery({ sentAt: fakeClock(container).now() - maxWaitMs }));

            await fakeScheduler(container).tick();

            expect(await statusOf(container)).toBe(DeliveryStatus.DISPUTED);
        });

        it("Should not dispute before the max wait", async () => {
            await givenDelivery(container, { offers: [] });
            startTracking(container);
            fakeClock(container).advance(container.get(TRACKING_OPTIONS).maxWaitMs - ONE_MS);

            await fakeScheduler(container).tick();

            expect(await statusOf(container)).toBe(DeliveryStatus.AWAITING_OFFER);
        });
    });

    describe("when steam rate limits a check", () => {
        it("Should skip the checks while backing off", async () => {
            await givenDelivery(container);
            const listSpy = jest
                .spyOn(container.get(RECEIVED_OFFERS_GATEWAY), "listReceivedActive")
                .mockRejectedValue(RATE_LIMITED);
            startTracking(container);
            await fakeScheduler(container).tick();
            fakeClock(container).advance(container.get(TRACKING_OPTIONS).checkIntervalMs);

            await fakeScheduler(container).tick();

            expect(listSpy).toHaveBeenCalledTimes(1);
        });

        it("Should check again once the back off is over", async () => {
            await givenDelivery(container);
            const listSpy = jest
                .spyOn(container.get(RECEIVED_OFFERS_GATEWAY), "listReceivedActive")
                .mockRejectedValue(RATE_LIMITED);
            startTracking(container);
            await fakeScheduler(container).tick();
            fakeClock(container).advance(container.get(TRACKING_OPTIONS).maxBackoffMs);

            await fakeScheduler(container).tick();

            expect(listSpy).toHaveBeenCalledTimes(2);
        });

        it("Should double the back off after each rate limited check", async () => {
            await givenDelivery(container);
            const { checkIntervalMs } = container.get(TRACKING_OPTIONS);
            const listSpy = jest
                .spyOn(container.get(RECEIVED_OFFERS_GATEWAY), "listReceivedActive")
                .mockRejectedValue(RATE_LIMITED);
            startTracking(container);
            await fakeScheduler(container).tick();
            fakeClock(container).advance(checkIntervalMs * 2);
            await fakeScheduler(container).tick();
            fakeClock(container).advance(checkIntervalMs * 2);

            await fakeScheduler(container).tick();

            expect(listSpy).toHaveBeenCalledTimes(2);
        });

        it("Should log the back off", async () => {
            await givenDelivery(container);
            jest.spyOn(container.get(RECEIVED_OFFERS_GATEWAY), "listReceivedActive").mockRejectedValue(RATE_LIMITED);
            const loggerSpy = jest.spyOn(container.get(LOGGER), "log");
            startTracking(container);

            await fakeScheduler(container).tick();

            expect(loggerSpy).toHaveBeenCalledWith(
                expect.stringContaining(`Rate limited checking trade "${TRADE_ID}"`),
            );
        });
    });

    it("Should log a failed check and keep tracking", async () => {
        await givenDelivery(container);
        jest.spyOn(container.get(RECEIVED_OFFERS_GATEWAY), "listReceivedActive").mockRejectedValue(new Error("boom"));
        const loggerSpy = jest.spyOn(container.get(LOGGER), "log");
        startTracking(container);

        await fakeScheduler(container).tick();

        expect([loggerSpy.mock.calls.flat(), fakeScheduler(container).activeIntervals().length]).toEqual([
            expect.arrayContaining([`Checking the offers of trade "${TRADE_ID}" failed: boom`]),
            1,
        ]);
    });

    describe("with two accounts", () => {
        it("Should accept each account's offer in its own steam session", async () => {
            await givenTwoAccounts(container);

            await fakeScheduler(container).tick();

            expect([
                await steamSession(container).getOfferState(OFFER_ID),
                await steamSession(container, SECOND_STEAM_ACCOUNT).getOfferState(SECOND_OFFER_ID),
            ]).toEqual([STEAM_OFFER_STATE.ACCEPTED, STEAM_OFFER_STATE.ACCEPTED]);
        });

        it("Should never accept one account's offer from the other account", async () => {
            await givenTwoAccounts(container);

            await fakeScheduler(container).tick();

            expect([
                await steamSession(container).getOfferState(SECOND_OFFER_ID),
                await steamSession(container, SECOND_STEAM_ACCOUNT).getOfferState(OFFER_ID),
            ]).toEqual([STEAM_OFFER_STATE.ACTIVE, STEAM_OFFER_STATE.ACTIVE]);
        });

        it("Should keep tracking one account when the other one stops", async () => {
            await givenTwoAccounts(container);

            container.get(DELIVERY_TRACKERS).untrack(trackedDelivery());

            expect(fakeScheduler(container).activeIntervals()).toHaveLength(1);
        });
    });
});
