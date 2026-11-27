import type { Clock } from "@/packages/application/clock";
import type { Logger } from "@/packages/application/logger";
import type { RawCsgEventsSink } from "../capture/raw-csg-events.sink";
import type { CsgDepositWsClient } from "../ws/csgoempire/csg-deposit.ws-client";

type Entry = Record<string, unknown>;

const TRADE_STATUS = "trade_status";
const DEPOSIT_FAILED = "deposit_failed";
const AUCTION_UPDATE = "auction_update";
const DELETED_ITEM = "deleted_item";
const WITHDRAWAL = "withdrawal";
const CAPTURE_PREFIX = "[CSG capture]";

export class RawCsgEventsCaptureWsController {
    private readonly ourItemIds = new Set<unknown>();

    constructor(
        private readonly wsClient: CsgDepositWsClient,
        private readonly sink: RawCsgEventsSink,
        private readonly clock: Clock,
        private readonly logger: Logger,
    ) {
        wsClient.on(TRADE_STATUS, (payload: unknown) => this.onTradeStatus(payload));
        wsClient.on(DEPOSIT_FAILED, (payload: unknown) => this.onDepositFailed(payload));
        wsClient.on(AUCTION_UPDATE, (payload: unknown) => this.onAuctionUpdate(payload));
        wsClient.on(DELETED_ITEM, (payload: unknown) => this.onDeletedItem(payload));
    }

    private onTradeStatus(payload: unknown): Promise<void> {
        this.asEntries(payload)
            .filter((update) => update.type !== WITHDRAWAL)
            .forEach((update) => this.learnDepositItem(this.asEntry(update.data)));
        return this.capture(TRADE_STATUS, payload);
    }

    private asEntries(payload: unknown): Entry[] {
        return this.asList(payload).map((entry) => this.asEntry(entry));
    }

    private asList(payload: unknown): unknown[] {
        return Array.isArray(payload) ? payload : [payload];
    }

    private asEntry(value: unknown): Entry {
        return typeof value === "object" && value !== null ? (value as Entry) : {};
    }

    private learnDepositItem(data: Entry): void {
        [data.item_id, this.asEntry(data.item).id]
            .filter((itemId) => typeof itemId === "number")
            .forEach((itemId) => this.ourItemIds.add(itemId));
    }

    private async capture(event: string, payload: unknown): Promise<void> {
        const accountId = this.wsClient.accountId;
        this.logger.log(`${CAPTURE_PREFIX} ${event} for account ${accountId}: ${JSON.stringify(payload)}`);
        const capturedAt = new Date(this.clock.now()).toISOString();
        await this.sink
            .append({ capturedAt, accountId, event, payload })
            .catch((error: unknown) => this.reportFailure(event, error));
    }

    private reportFailure(event: string, error: unknown): void {
        const reason = error instanceof Error ? error.message : String(error);
        this.logger.log(`${CAPTURE_PREFIX} couldn't write ${event}: ${reason}`);
    }

    private onDepositFailed(payload: unknown): Promise<void> {
        this.asEntries(payload).forEach((failure) =>
            this.learnDepositItem(this.asEntry(this.asEntry(failure.response).data)),
        );
        return this.capture(DEPOSIT_FAILED, payload);
    }

    private onAuctionUpdate(payload: unknown): Promise<void> {
        const ours = this.asEntries(payload).filter((update) => this.ourItemIds.has(update.id));
        return this.captureIfAny(AUCTION_UPDATE, ours);
    }

    private captureIfAny(event: string, ours: unknown[]): Promise<void> {
        return ours.length > 0 ? this.capture(event, ours) : Promise.resolve();
    }

    private onDeletedItem(payload: unknown): Promise<void> {
        const ours = this.asList(payload).filter((itemId) => this.ourItemIds.has(itemId));
        return this.captureIfAny(DELETED_ITEM, ours);
    }
}
