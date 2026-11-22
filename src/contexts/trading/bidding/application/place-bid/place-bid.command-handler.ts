import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import { PlaceBidCommand } from "./place-bid.command";
import type { AuctionGateway } from "./auction.gateway";
import type { EventBus } from "@/packages/application/event-bus";
import { BidPlacedEvent } from "./bid-placed.event";
import type { AccountRepository } from "../account.repository";
import { AccountId } from "../../domain/account/account-id";
import { AccountNotFoundError } from "../../domain/account/errors/account-not-found.error";
import type { Logger } from "@/packages/application/logger";
import type { AuctionParticipationRepository } from "../auction-participation.repository";
import { AuctionParticipation } from "../../domain/auction-participation/auction-participation";
import { AuctionId } from "../../domain/auction-participation/auction-id";

export class PlaceBidCommandHandler implements CommandHandler<PlaceBidCommand> {
    constructor(
        private readonly accountRepository: AccountRepository,
        private readonly auctionParticipationRepository: AuctionParticipationRepository,
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
        if (!account) throw new AccountNotFoundError(command.accountId);
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
            if (await this.isFirstBid(command)) {
                await this.auctionParticipationRepository.save(
                    AuctionParticipation.create({
                        auctionId: command.auctionId,
                        accountId: command.accountId,
                        maxBid: command.maxBid!,
                    }),
                );
            }
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

    private async isFirstBid(command: PlaceBidCommand): Promise<boolean> {
        return (
            !(await this.auctionParticipationRepository.findByAuctionId(new AuctionId(command.auctionId))) &&
            command.maxBid !== undefined
        );
    }
}
