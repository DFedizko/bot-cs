import type { Container } from "inversify";
import { COMMAND_BUS } from "@/packages/external/di/packages.identifiers";
import { INIT_CSG_SESSION, SOCKET_METADATA } from "@/contexts/trading/shared/external/di/trading-shared.identifiers";
import { NEW_ITEM_CONTROLLER } from "@/contexts/trading/bidding/external/di/bidding.identifiers";
import { SynchronizeAccountCommand } from "@/contexts/trading/bidding/application/synchronize-account/synchronize-account.command";

export class Bootstrap {
    constructor(private readonly container: Container) {}

    async run(): Promise<void> {
        const commandBus = await this.container.getAsync(COMMAND_BUS);
        const { user } = await this.container.getAsync(SOCKET_METADATA);
        await this.container.getAsync(INIT_CSG_SESSION);
        await commandBus.dispatch(new SynchronizeAccountCommand(user.id, user.steam_name, user.balance));
        await this.container.getAsync(NEW_ITEM_CONTROLLER);
    }
}
