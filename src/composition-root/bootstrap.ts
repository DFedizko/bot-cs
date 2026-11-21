import type { Container } from "inversify";
import {
    ASYNC_EVENT_BUS,
    ASYNC_EVENT_LISTENER,
    COMMAND_BUS,
    ENV,
    EVENT_BUS,
    EVENT_LISTENER,
    HTTP_SERVER,
} from "@/packages/external/di/packages.identifiers";
import type { EventBus } from "@/packages/application/event-bus";
import type { EventListener } from "@/packages/application/event-listener";
import type { Identifier } from "@/packages/external/di/identifier";
import { INIT_CSG_SESSION, SOCKET_METADATA } from "@/contexts/trading/shared/external/di/trading-shared.identifiers";
import {
    ADD_WANTED_ITEM_CONTROLLER,
    EDIT_WANTED_ITEM_CONTROLLER,
    NEW_ITEM_CONTROLLER,
    REMOVE_WANTED_ITEM_CONTROLLER,
    TOGGLE_WANTED_ITEM_CONTROLLER,
} from "@/contexts/trading/bidding/external/di/bidding.identifiers";
import {
    ACTIVE_WITHDRAWALS_CONTROLLER,
    TRADE_STATUS_CONTROLLER,
} from "@/contexts/delivery/external/di/delivery.identifiers";
import { SynchronizeAccountCommand } from "@/contexts/trading/bidding/application/synchronize-account/synchronize-account.command";

const HTTP_CONTROLLERS = [
    ADD_WANTED_ITEM_CONTROLLER,
    EDIT_WANTED_ITEM_CONTROLLER,
    REMOVE_WANTED_ITEM_CONTROLLER,
    TOGGLE_WANTED_ITEM_CONTROLLER,
];

export class Bootstrap {
    constructor(private readonly container: Container) {}

    async run(): Promise<void> {
        await this.subscribe(EVENT_LISTENER, EVENT_BUS);
        await this.subscribe(ASYNC_EVENT_LISTENER, ASYNC_EVENT_BUS);
        await this.startHttpServer();
        const commandBus = await this.container.getAsync(COMMAND_BUS);
        const { user } = await this.container.getAsync(SOCKET_METADATA);
        await this.container.getAsync(INIT_CSG_SESSION);
        await commandBus.dispatch(new SynchronizeAccountCommand(user.id, user.steam_name, user.balance));
        await this.container.getAsync(NEW_ITEM_CONTROLLER);
        await this.startDeliveryTracking(user.id);
    }

    private async subscribe(listenerId: Identifier<EventListener>, busId: Identifier<EventBus>): Promise<void> {
        const listeners = await this.container.getAllAsync(listenerId, { optional: true });
        (await this.container.getAsync(busId)).addSubscribers(listeners);
    }

    private async startDeliveryTracking(accountId: number): Promise<void> {
        await this.container.getAsync(TRADE_STATUS_CONTROLLER);
        await (await this.container.getAsync(ACTIVE_WITHDRAWALS_CONTROLLER)).resume(accountId);
    }

    private async startHttpServer(): Promise<void> {
        await Promise.all(HTTP_CONTROLLERS.map((controller) => this.container.getAsync(controller)));
        const httpServer = await this.container.getAsync(HTTP_SERVER);
        httpServer.listen(this.container.get(ENV).HTTP_PORT);
    }
}
