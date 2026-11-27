import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { CLOCK, LOGGER } from "@/packages/external/di/packages.identifiers";
import {
    CSG_DEPOSIT_WS_CLIENT,
    RAW_CSG_CAPTURE_CONTROLLER,
    RAW_CSG_EVENTS_SINK,
} from "@/contexts/trading/deposit/external/di/deposit.identifiers";
import {
    CsgDepositWsClientFakeAdapter,
    DEPOSITOR_ACCOUNT_ID,
} from "../../external/ws/csgoempire/csg-deposit.ws-client.fake-adapter";
import { RawCsgEventsSinkFakeAdapter, SINK_FAILURE } from "../../external/capture/raw-csg-events.sink.fake-adapter";
import {
    auctionUpdate,
    auctionUpdateEntry,
    CAPTURED_AT,
    CAPTURED_AT_MS,
    depositFailed,
    depositTradeStatus,
    depositTradeStatusWithItemOnly,
    OTHER_ITEM_ID,
    OUR_DEPOSIT_ITEM_ID,
    OUR_FAILED_ITEM_ID,
    withdrawalTradeStatus,
} from "./__mocks__/raw-csg-events.mock";

const CAPTURE_ENV = "development";
const TRADE_STATUS = "trade_status";
const DEPOSIT_FAILED = "deposit_failed";
const AUCTION_UPDATE = "auction_update";
const DELETED_ITEM = "deleted_item";
const CAPTURE_PREFIX = "[CSG capture]";

type Capture = { wsClient: CsgDepositWsClientFakeAdapter; sink: RawCsgEventsSinkFakeAdapter };

const startCapture = async (sink = new RawCsgEventsSinkFakeAdapter()): Promise<Capture> => {
    const wsClient = new CsgDepositWsClientFakeAdapter();
    container.rebind(CSG_DEPOSIT_WS_CLIENT).toConstantValue(wsClient);
    container.rebind(RAW_CSG_EVENTS_SINK).toConstantValue(sink);
    container.rebind(CLOCK).toConstantValue({ now: () => CAPTURED_AT_MS });
    await container.getAsync(RAW_CSG_CAPTURE_CONTROLLER);
    return { wsClient, sink };
};

const capturedEvents = ({ sink }: Capture): string[] => sink.records.map(({ event }) => event);

let container: Container;

describe("RawCsgEventsCaptureWsController", () => {
    beforeEach(() => {
        container = testContainer(CAPTURE_ENV);
        jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});
    });

    describe("when CSG reports one of our trades", () => {
        it("Should write the raw trade_status with the account and the time it arrived", async () => {
            const capture = await startCapture();

            await capture.wsClient.receive(TRADE_STATUS, depositTradeStatus());

            expect(capture.sink.records).toEqual([
                {
                    capturedAt: CAPTURED_AT,
                    accountId: DEPOSITOR_ACCOUNT_ID,
                    event: TRADE_STATUS,
                    payload: depositTradeStatus(),
                },
            ]);
        });

        it("Should log the raw trade_status", async () => {
            const capture = await startCapture();
            const logSpy = jest.spyOn(container.get(LOGGER), "log");

            await capture.wsClient.receive(TRADE_STATUS, depositTradeStatus());

            expect(logSpy).toHaveBeenCalledWith(
                `${CAPTURE_PREFIX} ${TRADE_STATUS} for account ${DEPOSITOR_ACCOUNT_ID}: ${JSON.stringify(depositTradeStatus())}`,
            );
        });

        it("Should write a trade_status sent as a single object, not a list", async () => {
            const capture = await startCapture();
            const [single] = depositTradeStatus();

            await capture.wsClient.receive(TRADE_STATUS, single);

            expect(capture.sink.records.map(({ payload }) => payload)).toEqual([single]);
        });

        it("Should write a trade_status it can't read, as it came", async () => {
            const capture = await startCapture();

            await capture.wsClient.receive(TRADE_STATUS, null);

            expect(capture.sink.records.map(({ payload }) => payload)).toEqual([null]);
        });

        it("Should write the raw deposit_failed", async () => {
            const capture = await startCapture();

            await capture.wsClient.receive(DEPOSIT_FAILED, depositFailed());

            expect(capture.sink.records.map(({ payload }) => payload)).toEqual([depositFailed()]);
        });
    });

    describe("when CSG broadcasts an item update", () => {
        it("Should skip an auction_update of items that aren't our deposits", async () => {
            const capture = await startCapture();

            await capture.wsClient.receive(AUCTION_UPDATE, auctionUpdate([OTHER_ITEM_ID]));

            expect(capture.sink.records).toEqual([]);
        });

        it("Should keep only our deposit's entry of an auction_update", async () => {
            const capture = await startCapture();
            await capture.wsClient.receive(TRADE_STATUS, depositTradeStatus());

            await capture.wsClient.receive(AUCTION_UPDATE, auctionUpdate([OTHER_ITEM_ID, OUR_DEPOSIT_ITEM_ID]));

            expect(capture.sink.records.at(-1)?.payload).toEqual(auctionUpdate([OUR_DEPOSIT_ITEM_ID]));
        });

        it("Should know our deposit from the item of its trade_status", async () => {
            const capture = await startCapture();
            await capture.wsClient.receive(TRADE_STATUS, depositTradeStatusWithItemOnly());

            await capture.wsClient.receive(AUCTION_UPDATE, auctionUpdateEntry(OUR_DEPOSIT_ITEM_ID));

            expect(capture.sink.records.at(-1)?.payload).toEqual(auctionUpdate([OUR_DEPOSIT_ITEM_ID]));
        });

        it("Should keep only our deposits' ids of a deleted_item", async () => {
            const capture = await startCapture();
            await capture.wsClient.receive(TRADE_STATUS, depositTradeStatus());

            await capture.wsClient.receive(DELETED_ITEM, [OTHER_ITEM_ID, OUR_DEPOSIT_ITEM_ID]);

            expect(capture.sink.records.at(-1)?.payload).toEqual([OUR_DEPOSIT_ITEM_ID]);
        });

        it("Should know an item whose deposit failed", async () => {
            const capture = await startCapture();
            await capture.wsClient.receive(DEPOSIT_FAILED, depositFailed());

            await capture.wsClient.receive(DELETED_ITEM, OUR_FAILED_ITEM_ID);

            expect(capture.sink.records.at(-1)?.payload).toEqual([OUR_FAILED_ITEM_ID]);
        });

        it("Should not take the item of a withdrawal for one of our deposits", async () => {
            const capture = await startCapture();
            await capture.wsClient.receive(TRADE_STATUS, withdrawalTradeStatus());

            await capture.wsClient.receive(DELETED_ITEM, [OUR_DEPOSIT_ITEM_ID]);

            expect(capturedEvents(capture)).toEqual([TRADE_STATUS]);
        });
    });

    describe("when the capture file can't be written", () => {
        it("Should log the failure instead of throwing", async () => {
            const capture = await startCapture(new RawCsgEventsSinkFakeAdapter(true));
            const logSpy = jest.spyOn(container.get(LOGGER), "log");

            await capture.wsClient.receive(TRADE_STATUS, depositTradeStatus());

            expect(logSpy).toHaveBeenCalledWith(`${CAPTURE_PREFIX} couldn't write ${TRADE_STATUS}: ${SINK_FAILURE}`);
        });
    });

    describe("in production", () => {
        it("Should not capture anything", () => {
            const productionContainer = testContainer();

            expect(productionContainer.isBound(RAW_CSG_CAPTURE_CONTROLLER)).toBe(false);
        });
    });
});
