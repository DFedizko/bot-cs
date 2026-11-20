import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { EVENT_BUS, LOGGER } from "@/packages/external/di/packages.identifiers";
import { DELIVERY_REPOSITORY, START_DELIVERY_HANDLER } from "@/contexts/delivery/external/di/delivery.identifiers";
import { StartDeliveryCommand } from "@/contexts/delivery/application/start-delivery/start-delivery.command";
import { DeliveryStartedEvent } from "@/contexts/delivery/application/start-delivery/delivery-started.event";
import { DeliveryStatus } from "@/contexts/delivery/domain/delivery/delivery-status";
import { TradeId } from "@/contexts/delivery/domain/delivery/trade-id";
import {
    ACCOUNT_ID,
    ASSET_ID,
    MARKET_NAME,
    SELLER_STEAM_ID,
    TRADE_ID,
} from "../../domain/__builders__/delivery.builder";

const startDeliveryCommand = () =>
    new StartDeliveryCommand({
        tradeId: TRADE_ID,
        accountId: ACCOUNT_ID,
        assetId: ASSET_ID,
        marketName: MARKET_NAME,
        appId: 730,
        sellerSteamId: SELLER_STEAM_ID,
    });

let container: Container;

describe("StartDeliveryCommandHandler", () => {
    beforeEach(() => {
        container = testContainer();
        jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});
    });

    it("Should start awaiting the trade offer of the bought item", async () => {
        await container.get(START_DELIVERY_HANDLER).handle(startDeliveryCommand());

        const delivery = await container.get(DELIVERY_REPOSITORY).findByTradeId(new TradeId(TRADE_ID));
        expect(delivery?.getStatus()).toBe(DeliveryStatus.AWAITING_OFFER);
    });

    it("Should publish that the delivery started", async () => {
        const publishSpy = jest.spyOn(container.get(EVENT_BUS), "publish");

        await container.get(START_DELIVERY_HANDLER).handle(startDeliveryCommand());

        const [[event]] = publishSpy.mock.calls[0];
        expect(event).toMatchObject({
            name: DeliveryStartedEvent.EVENT_NAME,
            payload: { tradeId: TRADE_ID, accountId: ACCOUNT_ID },
        });
    });

    it("Should keep the delivery it already tracks", async () => {
        const handler = container.get(START_DELIVERY_HANDLER);
        await handler.handle(startDeliveryCommand());
        const saveSpy = jest.spyOn(container.get(DELIVERY_REPOSITORY), "save");

        await handler.handle(startDeliveryCommand());

        expect(saveSpy).not.toHaveBeenCalled();
    });
});
