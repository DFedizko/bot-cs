import type { CommandHandler } from "@/shared/building-blocks/command-handler";
import { PlaceBidCommand } from "../commands/place-bid.command";
import type { CsgoempireGateway } from "../gateways/csgoempire.gateway";

export class PlaceBidCommandHandler implements CommandHandler<PlaceBidCommand> {
    constructor(
        private readonly csgoempireGateway: CsgoempireGateway,
        private readonly eventBus: EventBus,
    ) {}

    subscribedTo(): string {
        return PlaceBidCommand.COMMAND_NAME;
    }

    async handle(command: PlaceBidCommand): Promise<void> {
        await this.csgoempireGateway.placeBid(command.depositId, command.bidValue);

        await this.eventBus.publish();
    }
}
