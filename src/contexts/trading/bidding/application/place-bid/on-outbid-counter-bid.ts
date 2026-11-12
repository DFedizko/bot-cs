import type { EventListener } from "@/packages/application/event-listener";
import { OutbidEvent } from "../track-auction-update/outbid.event";
import type { Logger } from "@/packages/application/logger";
import type { CommandBus } from "@/packages/application/command-bus";
import { BidIncrementer } from "../../domain/bid-incrementer";
import { PlaceBidCommand } from "./place-bid.command";
import { CoinCent } from "@/contexts/trading/shared/domain/coin-cent";
import type { AuctionParticipationRepository } from "../auction-participation.repository";
import { AuctionId } from "../../domain/auction-participation/auction-id";
import { LeaveAuctionCommand } from "../leave-auction/leave-auction.command";

export class OnOutbidCounterBid implements EventListener {
    constructor(
        private readonly auctionParticipationRepo: AuctionParticipationRepository,
        private readonly logger: Logger,
        private readonly commandBus: CommandBus,
    ) {}

    subscribedTo(): string {
        return OutbidEvent.EVENT_NAME;
    }

    async on(event: OutbidEvent): Promise<void> {
        const { auctionId, accountId, value } = event.payload;
        const auctionParticipation = await this.auctionParticipationRepo.findByAuctionId(new AuctionId(auctionId));
        if (!auctionParticipation) {
            this.logger.log(`No participation was found by the auction id "${auctionId}"`);
            return;
        }
        const nextBid = BidIncrementer.nextFor(value);
        if (nextBid > auctionParticipation.getMaxBid()) {
            this.logger.log(
                `The next bid value (${CoinCent(nextBid).format()}) is bigger than the max bid value for this item (${CoinCent(auctionParticipation.getMaxBid()).format()})`,
            );
            await this.commandBus.dispatch(new LeaveAuctionCommand(auctionId));
            return;
        }
        await this.commandBus.dispatch(
            new PlaceBidCommand({
                auctionId,
                accountId,
                bidValue: nextBid,
            }),
        );
    }
}
