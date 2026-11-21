import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { LOGGER } from "@/packages/external/di/packages.identifiers";
import {
    CSG_DELIVERY_WS_CLIENT,
    DELIVERY_REPOSITORY,
    TRADE_STATUS_CONTROLLER,
} from "@/contexts/delivery/external/di/delivery.identifiers";
import { DeliveryStatus } from "@/contexts/delivery/domain/delivery/delivery-status";
import { TradeId } from "@/contexts/delivery/domain/delivery/trade-id";
import { CS_APP_ID } from "@/contexts/shared-kernel/domain/cs-app-id";
import {
    ACCOUNT_ID,
    ASSET_ID,
    MARKET_NAME,
    SELLER_STEAM_ID,
    TRADE_ID,
    TRADE_OFFER_ID,
} from "@/contexts/delivery/domain/__builders__/delivery.builder";
import { CsgDeliveryWsClientFakeAdapter } from "../../external/ws/csgoempire/csg-delivery.ws-client.fake-adapter";
import { tradeWithdrawal } from "../../external/http/csgoempire/__mocks__/trade-withdrawal.mock";
import { fakeScheduler } from "../../__builders__/tracking.builder";
import { depositStatus, SENDING, TERMINAL_STATUSES, tradeStatus } from "./__mocks__/trade-status.mock";

const TRADE_STATUS = "trade_status";

const listenTo = async (container: Container): Promise<CsgDeliveryWsClientFakeAdapter> => {
    const wsClient = new CsgDeliveryWsClientFakeAdapter();
    container.rebind(CSG_DELIVERY_WS_CLIENT).toConstantValue(wsClient);
    await container.getAsync(TRADE_STATUS_CONTROLLER);
    return wsClient;
};

const findDelivery = (container: Container) => container.get(DELIVERY_REPOSITORY).findByTradeId(new TradeId(TRADE_ID));

let container: Container;

describe("TradeStatusWsController", () => {
    beforeEach(() => {
        container = testContainer();
        jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});
    });

    describe("when a withdrawal was sent", () => {
        it("Should start the delivery of the bought item", async () => {
            const wsClient = await listenTo(container);

            await wsClient.receive(TRADE_STATUS, tradeStatus());

            expect((await findDelivery(container))?.toPrimitives()).toMatchObject({
                tradeId: TRADE_ID,
                tradeOfferId: TRADE_OFFER_ID,
                accountId: ACCOUNT_ID,
                expectedItem: { assetId: ASSET_ID, marketName: MARKET_NAME, appId: CS_APP_ID },
                sellerSteamId: SELLER_STEAM_ID,
                status: DeliveryStatus.AWAITING_OFFER,
            });
        });

        it("Should start tracking its offer", async () => {
            const wsClient = await listenTo(container);

            await wsClient.receive(TRADE_STATUS, tradeStatus());

            expect(fakeScheduler(container).activeIntervals()).toHaveLength(1);
        });

        it("Should start one delivery and one tracker when the status arrives twice", async () => {
            const wsClient = await listenTo(container);
            await wsClient.receive(TRADE_STATUS, tradeStatus());
            const saveSpy = jest.spyOn(container.get(DELIVERY_REPOSITORY), "save");

            await wsClient.receive(TRADE_STATUS, tradeStatus());

            expect([saveSpy.mock.calls.length, fakeScheduler(container).activeIntervals().length]).toEqual([0, 1]);
        });

        it("Should not expect a seller when csgoempire names no partner", async () => {
            const wsClient = await listenTo(container);
            const { metadata } = tradeWithdrawal();

            await wsClient.receive(TRADE_STATUS, tradeStatus({ metadata: { ...metadata, partner: undefined } }));

            expect((await findDelivery(container))?.getSellerSteamId()).toBeUndefined();
        });

        it("Should not track a withdrawal whose asset is unknown, so nothing is accepted blindly", async () => {
            const wsClient = await listenTo(container);
            const { item } = tradeWithdrawal();

            await wsClient.receive(TRADE_STATUS, tradeStatus({ item: { ...item, asset_id: undefined } }));

            expect([await findDelivery(container), fakeScheduler(container).activeIntervals()]).toEqual([
                undefined,
                [],
            ]);
        });
    });

    it.each(TERMINAL_STATUSES)("Should stop tracking when the trade is $status_message", async (terminal) => {
        const wsClient = await listenTo(container);
        await wsClient.receive(TRADE_STATUS, tradeStatus());

        await wsClient.receive(TRADE_STATUS, tradeStatus(terminal));

        expect(fakeScheduler(container).activeIntervals()).toEqual([]);
    });

    it("Should ignore a withdrawal still being sent", async () => {
        const wsClient = await listenTo(container);

        await wsClient.receive(TRADE_STATUS, tradeStatus(SENDING));

        expect(await findDelivery(container)).toBeUndefined();
    });

    it("Should ignore deposits", async () => {
        const wsClient = await listenTo(container);

        await wsClient.receive(TRADE_STATUS, depositStatus());

        expect(await findDelivery(container)).toBeUndefined();
    });

    it("Should log a status it could not handle instead of crashing the socket", async () => {
        const wsClient = await listenTo(container);
        const loggerSpy = jest.spyOn(container.get(LOGGER), "log");

        await wsClient.receive(TRADE_STATUS, tradeStatus({ tradeoffer_id: -1 }));

        expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining(`Could not handle trade "${TRADE_ID}"`));
    });
});
