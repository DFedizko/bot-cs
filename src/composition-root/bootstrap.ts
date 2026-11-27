import type { Container } from "inversify";
import {
    API_REFERENCE_CONTROLLER,
    ASYNC_EVENT_BUS,
    ASYNC_EVENT_LISTENER,
    COMMAND_BUS,
    ENV,
    EVENT_BUS,
    EVENT_LISTENER,
    HTTP_CONTROLLER,
    HTTP_SERVER,
    LOGGER,
    UNHANDLED_ERROR_TRAP,
} from "@/packages/external/di/packages.identifiers";
import type { EventBus } from "@/packages/application/event-bus";
import type { EventListener } from "@/packages/application/event-listener";
import type { Identifier } from "@/packages/external/di/identifier";
import { INIT_CSG_SESSION, SOCKET_METADATA } from "@/contexts/trading/shared/external/di/trading-shared.identifiers";
import { NEW_ITEM_CONTROLLER } from "@/contexts/trading/bidding/external/di/bidding.identifiers";
import {
    ACTIVE_WITHDRAWALS_CONTROLLER,
    TRADE_STATUS_CONTROLLER,
} from "@/contexts/delivery/external/di/delivery.identifiers";
import { RAW_CSG_CAPTURE_CONTROLLER } from "@/contexts/trading/deposit/external/di/deposit.identifiers";
import { CATALOG_LOADING_CONTROLLER } from "@/contexts/catalog/external/di/catalog.identifiers";
import { ApiReferenceHttpController } from "@/packages/infrastructure/http/docs/api-reference.http-controller";
import { SynchronizeAccountCommand } from "@/contexts/trading/bidding/application/synchronize-account/synchronize-account.command";

const DOCS_MESSAGE = "Docs available at:";
const LOCAL_ORIGIN = "http://localhost";

export class Bootstrap {
    constructor(private readonly container: Container) {}

    async run(): Promise<void> {
        this.container.get(UNHANDLED_ERROR_TRAP).install();
        await this.subscribe(EVENT_LISTENER, EVENT_BUS);
        await this.subscribe(ASYNC_EVENT_LISTENER, ASYNC_EVENT_BUS);
        await this.startHttpServer();
        await this.startCatalogLoading();
        const commandBus = await this.container.getAsync(COMMAND_BUS);
        const { user } = await this.container.getAsync(SOCKET_METADATA);
        await this.container.getAsync(INIT_CSG_SESSION);
        await commandBus.dispatch(new SynchronizeAccountCommand(user.id, user.steam_name, user.balance));
        await this.container.getAsync(NEW_ITEM_CONTROLLER);
        await this.startDeliveryTracking(user.id);
        await this.startRawCsgCapture();
    }

    private async subscribe(listenerId: Identifier<EventListener>, busId: Identifier<EventBus>): Promise<void> {
        const listeners = await this.container.getAllAsync(listenerId, { optional: true });
        (await this.container.getAsync(busId)).addSubscribers(listeners);
    }

    private async startCatalogLoading(): Promise<void> {
        const controller = await this.container.getAsync(CATALOG_LOADING_CONTROLLER);
        void controller.start();
    }

    private async startDeliveryTracking(accountId: number): Promise<void> {
        await this.container.getAsync(TRADE_STATUS_CONTROLLER);
        await (await this.container.getAsync(ACTIVE_WITHDRAWALS_CONTROLLER)).resume(accountId);
    }

    private async startRawCsgCapture(): Promise<void> {
        if (this.container.isBound(RAW_CSG_CAPTURE_CONTROLLER))
            await this.container.getAsync(RAW_CSG_CAPTURE_CONTROLLER);
    }

    private async startHttpServer(): Promise<void> {
        await this.container.getAllAsync(HTTP_CONTROLLER);
        const httpServer = await this.container.getAsync(HTTP_SERVER);
        const port = this.container.get(ENV).HTTP_PORT;
        httpServer.listen(port);
        this.announceApiDocs(port);
    }

    private announceApiDocs(port: number): void {
        if (!this.container.isBound(API_REFERENCE_CONTROLLER)) return;
        const docsUrl = `${LOCAL_ORIGIN}:${port}${ApiReferenceHttpController.PATH}`;
        this.container.get(LOGGER).log(`${DOCS_MESSAGE} ${docsUrl}`);
    }
}
