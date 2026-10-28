import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import { PlaceBidCommand } from "./place-bid.command";
import type { AuctionGateway } from "../auction.gateway";
import type { EventBus } from "@/packages/application/event-bus";
import { BidPlacedEvent } from "../events/bid-placed.event";
import type { AccountBalanceStore } from "../account-balance.store";

export class PlaceBidCommandHandler implements CommandHandler<PlaceBidCommand> {
    constructor(
        private readonly accountBalanceStore: AccountBalanceStore,
        private readonly auctionGateway: AuctionGateway,
        private readonly eventBus: EventBus,
    ) {}

    subscribedTo(): string {
        return PlaceBidCommand.COMMAND_NAME;
    }

    async handle(command: PlaceBidCommand): Promise<void> {
        const balance = this.accountBalanceStore.getBalance();
        if (!balance.covers(command.bidValue)) return;
        this.accountBalanceStore.reserve(command.bidValue);
        try {
            const bidPlaced = await this.auctionGateway.placeBid(command.auctionId, command.bidValue);
            await this.eventBus.publish([
                new BidPlacedEvent({
                    auctionId: bidPlaced.id,
                    bidValue: bidPlaced.highestBid,
                    bidderId: bidPlaced.bidderId,
                }),
            ]);
        } catch (error: unknown) {
            // TODO: check auction error to refund amount;
            this.accountBalanceStore.refund(command.bidValue);
            throw error;
        }
    }
}
