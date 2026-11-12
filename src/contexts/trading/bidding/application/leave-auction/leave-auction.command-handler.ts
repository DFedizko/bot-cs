import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import { LeaveAuctionCommand } from "./leave-auction.command";
import type { AuctionParticipationRepository } from "../auction-participation.repository";
import { AuctionId } from "../../domain/auction-participation/auction-id";

export class LeaveAuctionCommandHandler implements CommandHandler<LeaveAuctionCommand> {
    constructor(private readonly auctionParticipationRepository: AuctionParticipationRepository) {}

    subscribedTo(): string {
        return LeaveAuctionCommand.COMMAND_NAME;
    }

    async handle(command: LeaveAuctionCommand): Promise<void> {
        await this.auctionParticipationRepository.removeByAuctionId(new AuctionId(command.auctionId));
    }
}
