import type { CommandHandler } from "@/shared/building-blocks/command-handler";
import { PlaceBidCommand } from "../commands/place-bid.command";
import type { AuctionGateway } from "../gateways/auction.gateway";
import type { EventBus } from "@/shared/application/event-bus";
import { BidPlacedEvent } from "../events/bid-placed.event";

export class PlaceBidCommandHandler implements CommandHandler<PlaceBidCommand> {
    constructor(
        private readonly auctionGateway: AuctionGateway,
        private readonly eventBus: EventBus,
    ) {}

    subscribedTo(): string {
        return PlaceBidCommand.COMMAND_NAME;
    }

    async handle(command: PlaceBidCommand): Promise<void> {
        const bidPlaced = await this.auctionGateway.placeBid(command.auctionId, command.bidValue);
        await this.eventBus.publish([
            new BidPlacedEvent({
                auctionId: command.auctionId,
                bidValue: command.bidValue,
                bidderId: bidPlaced.bidderId,
            }),
        ]);
    }
}
