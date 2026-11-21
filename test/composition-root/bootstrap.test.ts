import type { Container } from "inversify";
import { Bootstrap } from "@/composition-root/bootstrap";
import { testContainer } from "@/__builders__/test-container.builder";
import {
    COMMAND_BUS,
    ENV,
    EVENT_BUS,
    EVENT_LISTENER,
    HTTP_SERVER,
    LOGGER,
} from "@/packages/external/di/packages.identifiers";
import {
    ACTIVE_WITHDRAWALS_CONTROLLER,
    CSG_DELIVERY_WS_CLIENT,
    DELIVERY_REPOSITORY,
} from "@/contexts/delivery/external/di/delivery.identifiers";
import { CsgDeliveryWsClientFakeAdapter } from "@/contexts/delivery/external/ws/csgoempire/csg-delivery.ws-client.fake-adapter";
import { tradeStatus } from "@/contexts/delivery/infrastructure/controllers/__mocks__/trade-status.mock";
import { fakeScheduler } from "@/contexts/delivery/__builders__/tracking.builder";
import { AcceptDeliveryOfferCommand, StartDeliveryCommand } from "@/contexts/delivery";
import { DeliveryStatus } from "@/contexts/delivery/domain/delivery/delivery-status";
import { TradeId } from "@/contexts/delivery/domain/delivery/trade-id";
import {
    ACCOUNT_ID,
    ASSET_ID,
    MARKET_NAME,
    SELLER_STEAM_ID,
    TRADE_ID,
    TRADE_OFFER_ID,
} from "@/contexts/delivery/domain/__builders__/delivery.builder";
import { CSG_WS_CLIENT } from "@/contexts/trading/shared/external/di/trading-shared.identifiers";
import { ACCOUNT_REPOSITORY } from "@/contexts/trading/bidding/external/di/bidding.identifiers";
import { AccountId } from "@/contexts/trading/bidding/domain/account/account-id";
import { getSktMetafakeResponse } from "@/contexts/trading/shared/external/csgoempire/http/socket-metadata.http.fake-adapter";

const DRY_RUN_ENV = "development";
const WANTED_ITEMS_PATH = "/accounts/:accountId/wanted-items";
const WANTED_ITEM_PATH = `${WANTED_ITEMS_PATH}/:name`;
const WANTED_ITEM_ENABLED_PATH = `${WANTED_ITEM_PATH}/enabled`;
const WANTED_ITEM_ROUTES = [
    ["post", WANTED_ITEMS_PATH],
    ["patch", WANTED_ITEM_PATH],
    ["delete", WANTED_ITEM_PATH],
    ["patch", WANTED_ITEM_ENABLED_PATH],
] as const;
const CS_APP_ID = 730;

const flushEventBus = (): Promise<void> => new Promise((resolve) => setImmediate(resolve));

const receiveSentWithdrawal = async (container: Container): Promise<void> => {
    const wsClient = new CsgDeliveryWsClientFakeAdapter();
    container.rebind(CSG_DELIVERY_WS_CLIENT).toConstantValue(wsClient);
    await new Bootstrap(container).run();
    await wsClient.receive("trade_status", tradeStatus());
    await fakeScheduler(container).tick();
};

const startDeliveryCommand = () =>
    new StartDeliveryCommand({
        tradeId: TRADE_ID,
        tradeOfferId: TRADE_OFFER_ID,
        accountId: ACCOUNT_ID,
        assetId: ASSET_ID,
        marketName: MARKET_NAME,
        appId: CS_APP_ID,
        sellerSteamId: SELLER_STEAM_ID,
    });

let container: Container;

describe("Bootstrap", () => {
    beforeEach(() => {
        container = testContainer(DRY_RUN_ENV);
        jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});
    });

    afterEach(async () => {
        await container.get(HTTP_SERVER).close();
    });

    it("Should synchronize the csgoempire account", async () => {
        await new Bootstrap(container).run();

        const account = await container.get(ACCOUNT_REPOSITORY).findById(new AccountId(getSktMetafakeResponse.user.id));
        expect(account?.getName()).toBe(getSktMetafakeResponse.user.steam_name);
    });

    it("Should start the csgoempire session", async () => {
        const wsOnSpy = jest.spyOn(await container.getAsync(CSG_WS_CLIENT), "on");

        await new Bootstrap(container).run();

        expect(wsOnSpy).toHaveBeenCalledWith("init", expect.any(Function));
    });

    it("Should listen to new items", async () => {
        const wsOnSpy = jest.spyOn(await container.getAsync(CSG_WS_CLIENT), "on");

        await new Bootstrap(container).run();

        expect(wsOnSpy).toHaveBeenCalledWith("new_item", expect.any(Function));
    });

    it("Should listen to trade statuses", async () => {
        const wsOnSpy = jest.spyOn(await container.getAsync(CSG_WS_CLIENT), "on");

        await new Bootstrap(container).run();

        expect(wsOnSpy).toHaveBeenCalledWith("trade_status", expect.any(Function));
    });

    it("Should resume the deliveries of the csgoempire account", async () => {
        const resumeSpy = jest.spyOn(await container.getAsync(ACTIVE_WITHDRAWALS_CONTROLLER), "resume");

        await new Bootstrap(container).run();

        expect(resumeSpy).toHaveBeenCalledWith(getSktMetafakeResponse.user.id);
    });

    it("Should start the http server on the configured port", async () => {
        const listenSpy = jest.spyOn(container.get(HTTP_SERVER), "listen");

        await new Bootstrap(container).run();

        expect(listenSpy).toHaveBeenCalledWith(container.get(ENV).HTTP_PORT);
    });

    it.each(WANTED_ITEM_ROUTES)("Should serve %s %s", async (method, path) => {
        const routeSpy = jest.spyOn(container.get(HTTP_SERVER), method);

        await new Bootstrap(container).run();

        expect(routeSpy).toHaveBeenCalledWith(path, expect.any(Function));
    });

    it("Should register the routes before listening", async () => {
        const httpServer = container.get(HTTP_SERVER);
        const postSpy = jest.spyOn(httpServer, "post");
        const listenSpy = jest.spyOn(httpServer, "listen");

        await new Bootstrap(container).run();

        expect(postSpy.mock.invocationCallOrder[0]).toBeLessThan(listenSpy.mock.invocationCallOrder[0]!);
    });

    it("Should start the http server before synchronizing with csgoempire", async () => {
        const listenSpy = jest.spyOn(container.get(HTTP_SERVER), "listen");
        const dispatchSpy = jest.spyOn(await container.getAsync(COMMAND_BUS), "dispatch");

        await new Bootstrap(container).run();

        expect(listenSpy.mock.invocationCallOrder[0]).toBeLessThan(dispatchSpy.mock.invocationCallOrder[0]!);
    });

    it("Should subscribe the event listeners to the event bus", async () => {
        const subscribeSpy = jest.spyOn(container.get(EVENT_BUS), "addSubscribers");

        await new Bootstrap(container).run();

        expect(subscribeSpy).toHaveBeenCalledWith(await container.getAllAsync(EVENT_LISTENER));
    });

    it("Should drive an accepted delivery offer to a received delivery through events", async () => {
        await new Bootstrap(container).run();
        const commandBus = await container.getAsync(COMMAND_BUS);
        await commandBus.dispatch(startDeliveryCommand());
        await commandBus.dispatch(new AcceptDeliveryOfferCommand(TRADE_ID));

        await flushEventBus();

        const delivery = await container.get(DELIVERY_REPOSITORY).findByTradeId(new TradeId(TRADE_ID));
        expect(delivery?.getStatus()).toBe(DeliveryStatus.RECEIVED);
    });

    it("Should receive a sent withdrawal's item on a later check", async () => {
        await receiveSentWithdrawal(container);

        await flushEventBus();

        const delivery = await container.get(DELIVERY_REPOSITORY).findByTradeId(new TradeId(TRADE_ID));
        expect(delivery?.getStatus()).toBe(DeliveryStatus.RECEIVED);
    });

    it("Should stop tracking once the item is received", async () => {
        await receiveSentWithdrawal(container);

        await flushEventBus();

        expect(fakeScheduler(container).activeIntervals()).toEqual([]);
    });
});
