import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { LOGGER } from "@/packages/external/di/packages.identifiers";
import {
    DELIVERY_REPOSITORY,
    DELIVERY_TRACKERS,
    OFFER_ACCEPTANCE_GATEWAY,
    RECEIVED_OFFERS_GATEWAY,
    TRACKING_OPTIONS,
} from "@/contexts/delivery/external/di/delivery.identifiers";
import { DeliveryStatus } from "@/contexts/delivery/domain/delivery/delivery-status";
import { givenDelivery, steamSession } from "../../application/__builders__/delivery-scenario.builder";
import { awaitingDelivery } from "@/contexts/delivery/domain/__builders__/delivery.builder";
import { OFFER_ID } from "@/contexts/delivery/domain/__builders__/received-offer.builder";
import { CS_APP_ID } from "@/contexts/shared-kernel/domain/cs-app-id";
import { STEAM_OFFER_STATE } from "@/contexts/delivery/infrastructure/steam/steam-trade-offer";
import { steamEconItem, steamTradeOffer } from "../../external/steam/__mocks__/steam-trade-offer.mock";
import {
    fakeScheduler,
    SECOND_ACCOUNT_ID,
    SECOND_ASSET_ID,
    SECOND_STEAM_ACCOUNT,
    SECOND_TRADE_ID,
    SECOND_TRADE_OFFER_ID,
    deliveryStatus,
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

const CONCURRENT_TICKS = 3;

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

        expect(await deliveryStatus(container)).not.toBe(DeliveryStatus.AWAITING_OFFER);
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
