import { ContainerModule, type ContainerModuleLoadOptions, type ResolutionContext } from "inversify";
import {
    COMMAND_BUS,
    COMMAND_HANDLER,
    ENV,
    EVENT_BUS,
    EVENT_LISTENER,
    LOGGER,
} from "@/packages/external/di/packages.identifiers";
import type { CommandBus } from "@/packages/application/command-bus";
import type { EventBus } from "@/packages/application/event-bus";
import type { Logger } from "@/packages/application/logger";
import type { DeliveryRepository } from "../../application/delivery.repository";
import type { DeliveryTrackers, TrackedDelivery } from "../../application/delivery-trackers";
import { TrackDeliveryCommandHandler } from "../../application/track-delivery/track-delivery.command-handler";
import { StopDeliveryTrackingCommandHandler } from "../../application/stop-delivery-tracking/stop-delivery-tracking.command-handler";
import { OnDeliveryEndedStopTracking } from "../../application/stop-delivery-tracking/on-delivery-ended-stop-tracking";
import { DeliveryReceivedEvent } from "../../domain/delivery/events/delivery-received.event";
import { DeliveryDisputedEvent } from "../../domain/delivery/events/delivery-disputed.event";
import { DeliveryFailedEvent } from "../../domain/delivery/events/delivery-failed.event";
import { DeliveryCancelledEvent } from "../../domain/delivery/events/delivery-cancelled.event";
import { DeliveryTracker } from "../../infrastructure/tracking/delivery-tracker";
import { DeliveryTrackersSchedulerAdapter } from "../../infrastructure/tracking/delivery-trackers.scheduler-adapter";
import type { TrackingOptions } from "../../infrastructure/tracking/tracking-options";
import { SchedulerTimersAdapter } from "../scheduling/scheduler.timers-adapter";
import { ClockSystemAdapter } from "../scheduling/clock.system-adapter";
import { CSG_WS_CLIENT } from "@/contexts/trading/shared/external/di/trading-shared.identifiers";
import { WithdrawalTrackingDispatcher } from "../../infrastructure/controllers/withdrawal-tracking.dispatcher";
import { TradeStatusWsController } from "../../infrastructure/controllers/trade-status.ws-controller";
import type { CsgDeliveryWsClient } from "../../infrastructure/ws/csgoempire/csg-delivery.ws-client";
import { ActiveWithdrawalsStartupController } from "../../infrastructure/controllers/active-withdrawals.startup-controller";
import type { CsgDeliveryHttp } from "../../infrastructure/http/csgoempire/csg-delivery.http";
import {
    ACTIVE_WITHDRAWALS_CONTROLLER,
    CSG_DELIVERY_HTTP,
    CLOCK,
    CSG_DELIVERY_WS_CLIENT,
    TRADE_STATUS_CONTROLLER,
    WITHDRAWAL_DISPATCHER,
    DELIVERY_REPOSITORY,
    DELIVERY_TRACKERS,
    SCHEDULER,
    STOP_TRACKING_HANDLER,
    TRACK_DELIVERY_HANDLER,
    TRACKING_OPTIONS,
} from "./delivery.identifiers";

const MS_IN_SECOND = 1000;
const MS_IN_MINUTE = 60 * MS_IN_SECOND;
const DEFAULT_CHECK_INTERVAL_SECONDS = 45;
const DEFAULT_MAX_WAIT_MINUTES = 60;
const MAX_BACKOFF_MINUTES = 10;
const COMMAND_HANDLERS = [TRACK_DELIVERY_HANDLER, STOP_TRACKING_HANDLER];
const DELIVERY_ENDING_EVENTS = [
    DeliveryReceivedEvent.EVENT_NAME,
    DeliveryDisputedEvent.EVENT_NAME,
    DeliveryFailedEvent.EVENT_NAME,
    DeliveryCancelledEvent.EVENT_NAME,
];

export class DeliveryTrackingModule extends ContainerModule {
    constructor() {
        super((options) => DeliveryTrackingModule.bindAll(options));
    }

    private static bindAll(options: ContainerModuleLoadOptions): void {
        DeliveryTrackingModule.bindScheduling(options);
        DeliveryTrackingModule.bindHandlers(options);
        DeliveryTrackingModule.bindListeners(options);
        DeliveryTrackingModule.bindControllers(options);
        COMMAND_HANDLERS.forEach((handler) => options.bind(COMMAND_HANDLER).toService(handler));
    }

    private static bindScheduling({ bind }: ContainerModuleLoadOptions): void {
        bind(SCHEDULER)
            .toResolvedValue(() => new SchedulerTimersAdapter())
            .inSingletonScope();
        bind(CLOCK)
            .toResolvedValue(() => new ClockSystemAdapter())
            .inSingletonScope();
        bind(TRACKING_OPTIONS).toResolvedValue(DeliveryTrackingModule.readOptions, [ENV]).inSingletonScope();
        bind(DELIVERY_TRACKERS).toDynamicValue(DeliveryTrackingModule.createTrackers).inSingletonScope();
    }

    private static bindHandlers({ bind }: ContainerModuleLoadOptions): void {
        bind(TRACK_DELIVERY_HANDLER)
            .toResolvedValue(
                (repo: DeliveryRepository, trackers: DeliveryTrackers, logger: Logger) =>
                    new TrackDeliveryCommandHandler(repo, trackers, logger),
                [DELIVERY_REPOSITORY, DELIVERY_TRACKERS, LOGGER],
            )
            .inSingletonScope();
        bind(STOP_TRACKING_HANDLER)
            .toResolvedValue(
                (trackers: DeliveryTrackers, bus: EventBus, logger: Logger) =>
                    new StopDeliveryTrackingCommandHandler(trackers, bus, logger),
                [DELIVERY_TRACKERS, EVENT_BUS, LOGGER],
            )
            .inSingletonScope();
    }

    private static bindListeners({ bind }: ContainerModuleLoadOptions): void {
        DELIVERY_ENDING_EVENTS.forEach((eventName) =>
            bind(EVENT_LISTENER)
                .toResolvedValue(
                    (commandBus: CommandBus) => new OnDeliveryEndedStopTracking(eventName, commandBus),
                    [COMMAND_BUS],
                )
                .inSingletonScope(),
        );
    }

    private static bindControllers({ bind }: ContainerModuleLoadOptions): void {
        bind(CSG_DELIVERY_WS_CLIENT).toService(CSG_WS_CLIENT);
        bind(WITHDRAWAL_DISPATCHER)
            .toResolvedValue(
                (commandBus: CommandBus, logger: Logger) => new WithdrawalTrackingDispatcher(commandBus, logger),
                [COMMAND_BUS, LOGGER],
            )
            .inSingletonScope();
        bind(TRADE_STATUS_CONTROLLER)
            .toResolvedValue(
                (wsClient: CsgDeliveryWsClient, dispatcher: WithdrawalTrackingDispatcher) =>
                    new TradeStatusWsController(wsClient, dispatcher),
                [CSG_DELIVERY_WS_CLIENT, WITHDRAWAL_DISPATCHER],
            )
            .inSingletonScope();
        bind(ACTIVE_WITHDRAWALS_CONTROLLER)
            .toResolvedValue(
                (http: CsgDeliveryHttp, dispatcher: WithdrawalTrackingDispatcher, logger: Logger) =>
                    new ActiveWithdrawalsStartupController(http, dispatcher, logger),
                [CSG_DELIVERY_HTTP, WITHDRAWAL_DISPATCHER, LOGGER],
            )
            .inSingletonScope();
    }

    private static readOptions(env: AppEnv): TrackingOptions {
        return {
            checkIntervalMs: (env.DELIVERY_CHECK_INTERVAL_SECONDS ?? DEFAULT_CHECK_INTERVAL_SECONDS) * MS_IN_SECOND,
            maxWaitMs: (env.DELIVERY_MAX_WAIT_MINUTES ?? DEFAULT_MAX_WAIT_MINUTES) * MS_IN_MINUTE,
            maxBackoffMs: MAX_BACKOFF_MINUTES * MS_IN_MINUTE,
        };
    }

    private static createTrackers(context: ResolutionContext): DeliveryTrackers {
        const options = context.get(TRACKING_OPTIONS);
        const createTracker = (delivery: TrackedDelivery) =>
            new DeliveryTracker(delivery, {
                commandBus: context.get(COMMAND_BUS),
                clock: context.get(CLOCK),
                logger: context.get(LOGGER),
                options,
            });
        return new DeliveryTrackersSchedulerAdapter(context.get(SCHEDULER), createTracker, options.checkIntervalMs);
    }
}
