import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import { TrackAuctionUpdateCommand } from "./track-auction-update.command";
import type { AccountRepository } from "../account.repository";
import type { EventBus } from "@/packages/application/event-bus";
import { OutbidEvent } from "./outbid.event";
import type { Account } from "../../domain/account/account";

export class TrackAuctionUpdateCommandHandler implements CommandHandler<TrackAuctionUpdateCommand> {
    constructor(
        private readonly accountRepository: AccountRepository,
        private readonly eventBus: EventBus,
    ) {}

    subscribedTo(): string {
        return TrackAuctionUpdateCommand.COMMAND_NAME;
    }

    async handle(command: TrackAuctionUpdateCommand): Promise<void> {
        const { auctionId, bidderId, value, endsAt } = command;
        const accounts = await this.accountRepository.findMany();
        const accountWithReservation = this.findAccountWithReservation(accounts, auctionId);
        if (!accountWithReservation) return;
        if (this.outBidFromAccount(accounts, bidderId)) return;
        accountWithReservation.refundFor(auctionId);
        await this.accountRepository.save(accountWithReservation);
        await this.eventBus.publish([new OutbidEvent({ auctionId, bidderId, value, endsAt })]);
    }

    private findAccountWithReservation(accounts: Account[], reservationId: number): Account | undefined {
        return accounts.find((account) => account.hasReservationFor(reservationId));
    }

    private outBidFromAccount(accounts: Account[], bidderId: number): boolean {
        return accounts.some((account) => account.isMe(bidderId));
    }
}
