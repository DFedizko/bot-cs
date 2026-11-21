import type { CommandBus } from "@/packages/application/command-bus";
import type { Logger } from "@/packages/application/logger";
import { AcceptDeliveryOfferCommand } from "../../application/accept-delivery-offer/accept-delivery-offer.command";
import { DisputeDeliveryCommand } from "../../application/dispute-delivery/dispute-delivery.command";
import { StopDeliveryTrackingCommand } from "../../application/stop-delivery-tracking/stop-delivery-tracking.command";
import type { TrackedDelivery } from "../../application/delivery-trackers";
import type { Clock } from "./clock";
import type { TrackingOptions } from "./tracking-options";

export type DeliveryTrackerDeps = {
    commandBus: CommandBus;
    clock: Clock;
    logger: Logger;
    options: TrackingOptions;
};

export type DeliveryTrackerFactory = (delivery: TrackedDelivery) => DeliveryTracker;

const RATE_LIMITED = /429|rate ?limit|too many requests/i;
const BACKOFF_FACTOR = 2;
const NO_RATE_LIMITS = 0;
const MAX_WAIT_PASSED = "max_wait_passed";
const MS_IN_SECOND = 1000;

export class DeliveryTracker {
    private checking = false;
    private stopped = false;
    private rateLimits = NO_RATE_LIMITS;
    private pausedUntil: number;
    private readonly giveUpAt: number;

    constructor(
        private readonly delivery: TrackedDelivery,
        private readonly deps: DeliveryTrackerDeps,
    ) {
        this.pausedUntil = deps.clock.now();
        this.giveUpAt = Math.min(delivery.sentAt ?? deps.clock.now(), deps.clock.now()) + deps.options.maxWaitMs;
    }

    stop(): void {
        this.stopped = true;
    }

    async tick(): Promise<void> {
        if (this.stopped || this.checking || this.isPaused()) return;
        this.checking = true;
        try {
            await this.check();
            this.rateLimits = NO_RATE_LIMITS;
        } catch (error) {
            this.onFailedCheck(this.reasonOf(error));
        } finally {
            this.checking = false;
        }
    }

    private async check(): Promise<void> {
        await this.deps.commandBus.dispatch(new AcceptDeliveryOfferCommand(this.delivery.tradeId));
        if (this.deps.clock.now() >= this.giveUpAt) await this.giveUp();
    }

    private async giveUp(): Promise<void> {
        const { tradeId, accountId } = this.delivery;
        this.deps.logger.log(
            `Max wait passed for trade "${tradeId}" of account "${accountId}", disputing it if its offer is still missing`,
        );
        try {
            await this.deps.commandBus.dispatch(new DisputeDeliveryCommand(tradeId));
        } catch (error) {
            this.deps.logger.log(`Disputing trade "${tradeId}" failed: ${this.reasonOf(error)}, dispute it by hand`);
        } finally {
            await this.deps.commandBus.dispatch(
                new StopDeliveryTrackingCommand({ tradeId, accountId, reason: MAX_WAIT_PASSED }),
            );
        }
    }

    private reasonOf(error: unknown): string {
        return error instanceof Error ? error.message : String(error);
    }

    private onFailedCheck(reason: string): void {
        if (!RATE_LIMITED.test(reason))
            return this.deps.logger.log(`Checking the offers of trade "${this.delivery.tradeId}" failed: ${reason}`);
        this.rateLimits += 1;
        const backoffMs = this.backoffMs();
        this.pausedUntil = this.deps.clock.now() + backoffMs;
        this.deps.logger.log(
            `Rate limited checking trade "${this.delivery.tradeId}", backing off for ${backoffMs / MS_IN_SECOND}s`,
        );
    }

    private backoffMs(): number {
        const { checkIntervalMs, maxBackoffMs } = this.deps.options;
        return Math.min(checkIntervalMs * BACKOFF_FACTOR ** this.rateLimits, maxBackoffMs);
    }

    private isPaused(): boolean {
        return this.deps.clock.now() < this.pausedUntil;
    }
}
