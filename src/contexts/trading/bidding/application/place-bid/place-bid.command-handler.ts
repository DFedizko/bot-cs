import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import { PlaceBidCommand } from "./place-bid.command";
import type { AuctionDTO, AuctionGateway } from "./auction.gateway";
import type { EventBus } from "@/packages/application/event-bus";
import { BidPlacedEvent } from "./bid-placed.event";
import { BidRejectedError } from "./bid-rejected.error";
import type { AccountRepository } from "../account.repository";
import { AccountId } from "@/contexts/shared-kernel/domain/account-id";
import type { Account } from "../../domain/account/account";
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
        if (!account) throw new AccountNotFoundError(command.accountId);
        if (!account.covers(command.bidValue)) {
            this.logger.log(
                `Couldn't place bid on auction "${command.auctionId}" because the "${account.getName()}" account has insufficient balance`,
            );
            return;
        }
        account.reserveFor(command.auctionId, command.bidValue);
        await this.accountRepository.save(account);
        const bidPlaced = await this.placeBid(account, command);
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
    }

    private async placeBid(account: Account, command: PlaceBidCommand): Promise<AuctionDTO> {
        try {
            return await this.auctionGateway.placeBid(command.auctionId, command.bidValue);
        } catch (error: unknown) {
            if (!(error instanceof BidRejectedError)) return this.confirmBid(account, command, error);
            await this.refund(account, command.auctionId);
            throw error;
        }
    }

    private async confirmBid(account: Account, command: PlaceBidCommand, bidError: unknown): Promise<AuctionDTO> {
        const auctions = await this.findActiveAuctions(command, bidError);
        const placedBid = auctions.find((auction) => this.isOurBid(auction, account, command));
        if (placedBid) {
            this.logger.log(`${this.describeBid(command)} was confirmed as placed, keeping its reservation`);
            return placedBid;
        }
        this.logger.log(`${this.describeBid(command)} wasn't placed, refunding its reservation`);
        await this.refund(account, command.auctionId);
        throw bidError;
    }

    private async findActiveAuctions(command: PlaceBidCommand, bidError: unknown): Promise<AuctionDTO[]> {
        try {
            return await this.auctionGateway.getActiveAuctions();
        } catch {
            this.logger.log(
                `Couldn't confirm the bid of ${command.bidValue} on auction "${command.auctionId}", keeping its reservation`,
            );
            throw bidError;
        }
    }

    private isOurBid(auction: AuctionDTO, account: Account, command: PlaceBidCommand): boolean {
        return (
            auction.id === command.auctionId &&
            account.isMe(auction.bidderId) &&
            auction.highestBid === command.bidValue
        );
    }

    private describeBid(command: PlaceBidCommand): string {
        return `The bid of ${command.bidValue} on auction "${command.auctionId}"`;
    }

    private async refund(account: Account, auctionId: number): Promise<void> {
        account.refundFor(auctionId);
        await this.accountRepository.save(account);
    }

    private async isFirstBid(command: PlaceBidCommand): Promise<boolean> {
        return (
            !(await this.auctionParticipationRepository.findByAuctionId(new AuctionId(command.auctionId))) &&
            command.maxBid !== undefined
        );
    }
}
