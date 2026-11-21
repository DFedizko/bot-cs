import type { Container } from "inversify";
import { COMMAND_BUS, ENV, HTTP_SERVER } from "@/packages/external/di/packages.identifiers";
import { INIT_CSG_SESSION, SOCKET_METADATA } from "@/contexts/trading/shared/external/di/trading-shared.identifiers";
import {
    ADD_WANTED_ITEM_CONTROLLER,
    EDIT_WANTED_ITEM_CONTROLLER,
    NEW_ITEM_CONTROLLER,
    REMOVE_WANTED_ITEM_CONTROLLER,
    TOGGLE_WANTED_ITEM_CONTROLLER,
} from "@/contexts/trading/bidding/external/di/bidding.identifiers";
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
        await this.startHttpServer();
        const commandBus = await this.container.getAsync(COMMAND_BUS);
        const { user } = await this.container.getAsync(SOCKET_METADATA);
        await this.container.getAsync(INIT_CSG_SESSION);
        await commandBus.dispatch(new SynchronizeAccountCommand(user.id, user.steam_name, user.balance));
        await this.container.getAsync(NEW_ITEM_CONTROLLER);
    }

    private async startHttpServer(): Promise<void> {
        await Promise.all(HTTP_CONTROLLERS.map((controller) => this.container.getAsync(controller)));
        const httpServer = await this.container.getAsync(HTTP_SERVER);
        httpServer.listen(this.container.get(ENV).HTTP_PORT);
    }
}
