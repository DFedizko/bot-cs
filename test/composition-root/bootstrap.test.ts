import type { Container } from "inversify";
import { maxForPercentage } from "@/contexts/trading/bidding/domain/wanted-item/__builders__/max-for.builder";
import { Bootstrap } from "@/composition-root/bootstrap";
import { testContainer } from "@/__builders__/test-container.builder";
import {
    ASYNC_EVENT_BUS,
    ASYNC_EVENT_LISTENER,
    COMMAND_BUS,
    COMMAND_DISPATCHER,
    ENV,
    EVENT_BUS,
    EVENT_LISTENER,
    HTTP_SERVER,
    LOGGER,
    PROCESS_EVENTS,
} from "@/packages/external/di/packages.identifiers";
import type { EventEmitter } from "node:events";
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
import {
    ACCOUNT_REPOSITORY,
    AUCTION_GATEWAY,
    AUCTION_PARTICIPATION_REPO,
    WANTED_ITEM_REPOSITORY,
} from "@/contexts/trading/bidding/external/di/bidding.identifiers";
import { AccountId } from "@/contexts/trading/bidding/domain/account/account-id";
import { Account } from "@/contexts/trading/bidding/domain/account/account";
import { WantedItem } from "@/contexts/trading/bidding/domain/wanted-item/wanted-item";
import { AuctionId } from "@/contexts/trading/bidding/domain/auction-participation/auction-id";
import { newItem } from "@/contexts/trading/bidding/infrastructure/controllers/__mocks__/new-item.mock";
import { EvaluateItemCommand } from "@/contexts/trading/bidding/application/evaluate-item/evaluate-item.command";
import type { NewItem } from "@/contexts/trading/shared/infrastructure/csgoempire/ws-events/new-item";
import { evaluateItemCommand } from "@/contexts/trading/bidding/application/evaluate-item/__mocks__/evaluate-item.command.mock";
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
const UNHANDLED_REJECTION = "unhandledRejection";
const STRAY_FAILURE = "stray failure";
const BIDDER_BALANCE = 10_000;
const BIDDER_NAME = "John Doe";

const BID_FAILURE = "auction already ended";
const FAILING_AUCTION_ID = 288767047;
const NEXT_AUCTION_ID = 288767048;
const [AUCTION_ITEM] = newItem;
const twoAuctionItems: NewItem = [
    { ...AUCTION_ITEM!, id: FAILING_AUCTION_ID },
    { ...AUCTION_ITEM!, id: NEXT_AUCTION_ID },
];

const receiveWithFailingFirstBid = async (container: Container): Promise<void> => {
    const wsOnSpy = jest.spyOn(await container.getAsync(CSG_WS_CLIENT), "on");
    const dispatchSpy = jest.spyOn(await container.getAsync(COMMAND_DISPATCHER), "dispatch");
    await new Bootstrap(container).run();
    await approvedInAuctionItem(container);
    jest.spyOn(await container.getAsync(AUCTION_GATEWAY), "placeBid").mockRejectedValueOnce(new Error(BID_FAILURE));
    const [, onNewItem] = wsOnSpy.mock.calls.find(([event]) => event === "new_item")!;
    onNewItem(twoAuctionItems);
    await Promise.all(dispatchSpy.mock.results.map(({ value }) => value));
};

const approvedInAuctionItem = async (container: Container): Promise<void> => {
    const { accountId, itemName, aboveRecommendedPercentage } = evaluateItemCommand();
    await container
        .get(ACCOUNT_REPOSITORY)
        .save(Account.sync({ id: accountId, name: BIDDER_NAME, totalAmount: BIDDER_BALANCE }));
    await container
        .get(WANTED_ITEM_REPOSITORY)
        .save(WantedItem.create({ accountId, name: itemName, maxFor: maxForPercentage(aboveRecommendedPercentage) }));
};

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

        expect(routeSpy).toHaveBeenCalledWith(path, expect.any(Function), expect.anything());
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

    it("Should subscribe the side-effect event listeners to the async event bus", async () => {
        const subscribeSpy = jest.spyOn(container.get(ASYNC_EVENT_BUS), "addSubscribers");

        await new Bootstrap(container).run();

        expect(subscribeSpy).toHaveBeenCalledWith(await container.getAllAsync(ASYNC_EVENT_LISTENER));
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

    it("Should place the bid of an approved auction item before the evaluation resolves", async () => {
        await new Bootstrap(container).run();
        await approvedInAuctionItem(container);
        const commandBus = await container.getAsync(COMMAND_BUS);

        await commandBus.dispatch(evaluateItemCommand());

        const participation = await container
            .get(AUCTION_PARTICIPATION_REPO)
            .findByAuctionId(new AuctionId(evaluateItemCommand().itemId));
        expect(participation).toBeDefined();
    });

    it("Should log an unhandled rejection that slipped past the entry points", async () => {
        const logSpy = jest.spyOn(container.get(LOGGER), "log");
        await new Bootstrap(container).run();

        (container.get(PROCESS_EVENTS) as EventEmitter).emit(UNHANDLED_REJECTION, STRAY_FAILURE);

        expect(logSpy).toHaveBeenCalledWith(`Unhandled rejection: ${STRAY_FAILURE}`);
    });

    it("Should log a bid that failed with its item and account and keep the bot running", async () => {
        const logSpy = jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});

        await receiveWithFailingFirstBid(container);

        expect(logSpy).toHaveBeenCalledWith(
            expect.stringContaining(
                `Command "${EvaluateItemCommand.COMMAND_NAME}" failed (itemId=${FAILING_AUCTION_ID}, accountId=${evaluateItemCommand().accountId}): Error: ${BID_FAILURE}`,
            ),
        );
    });

    it("Should still bid on the next item after a bid failed", async () => {
        await receiveWithFailingFirstBid(container);

        const participation = await container
            .get(AUCTION_PARTICIPATION_REPO)
            .findByAuctionId(new AuctionId(NEXT_AUCTION_ID));
        expect(participation).toBeDefined();
    });
});
