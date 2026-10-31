import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import { PlaceBidCommand } from "./place-bid.command";
import type { AuctionGateway } from "./auction.gateway";
import type { EventBus } from "@/packages/application/event-bus";
import { BidPlacedEvent } from "./bid-placed.event";
import type { AccountRepository } from "../account.repository";
import { AccountId } from "../../domain/account/account-id";
import { NotFoundError } from "@/packages/infrastructure/http/errors/not-found.error";
import type { Logger } from "@/packages/application/logger";

export class PlaceBidCommandHandler implements CommandHandler<PlaceBidCommand> {
    constructor(
        private readonly accountRepository: AccountRepository,
        private readonly logger: Logger,
        private readonly auctionGateway: AuctionGateway,
        private readonly eventBus: EventBus,
    ) {}

    subscribedTo(): string {
        return PlaceBidCommand.COMMAND_NAME;
    }

    async handle(command: PlaceBidCommand): Promise<void> {
        const account = await this.accountRepository.findById(new AccountId(command.accountId));
        // TODO change this infrastructure level error
        if (!account) throw new NotFoundError(`Account not found by the id "${command.accountId}"`);
        if (!account.covers(command.bidValue)) {
            this.logger.log(
                `Couldn't place bid on auction "${command.auctionId}" because the "${account.getName()}" account has insufficient balance`,
            );
            return;
        }
        account.reserveFor(command.auctionId, command.bidValue);
        await this.accountRepository.save(account);
        try {
            const bidPlaced = await this.auctionGateway.placeBid(command.auctionId, command.bidValue);
            await this.eventBus.publish([
                new BidPlacedEvent({
                    auctionId: bidPlaced.id,
                    accountId: command.accountId,
                    bidValue: bidPlaced.highestBid,
                    bidderId: bidPlaced.bidderId,
                }),
            ]);
        } catch (error: unknown) {
            // TODO: check auction error to refund amount;
            account.refundFor(command.auctionId);
            await this.accountRepository.save(account);
            throw error;
        }
    }
}
