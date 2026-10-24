import type { EventListener } from "@/shared/application/event-listener";
import { SkinListedEvent } from "../events/skin-listed.event";
import type { CommandBus } from "@/shared/infrastructure/command-bus/command-bus";
import { PlaceBidCommand } from "../commands/place-bid.command";
import { BidIncrementer } from "../../domain/auction/bid-incrementer";
import type { Logger } from "@/shared/application/logger";
import type { WantedSkinRepository } from "../repositories/wanted-skin.repository";

export class SkinListedEventListener implements EventListener<SkinListedEvent> {
    constructor(
        private readonly wantedSkinRepository: WantedSkinRepository,
        private readonly logger: Logger,
        private readonly commandBus: CommandBus,
    ) {}

    subscribedTo(): string {
        return SkinListedEvent.EVENT_NAME;
    }

    async on(event: SkinListedEvent): Promise<void> {
        const { id, name, aboveRecommendedPercentage, price, numberOfBids, inAuction } = event.payload;
        if (!inAuction) return;
        const wantedSkin = await this.wantedSkinRepository.findByName(name);
        if (!wantedSkin) return;
        const decision = wantedSkin.evaluate({ value: price, aboveRecommendedPercentage });
        if (!decision.approved) return this.logger.log(decision.failures.join("; "));
        const nextBid = BidIncrementer.nextFor({ value: price, numberOfBids });
        await this.commandBus.dispatch(
            new PlaceBidCommand({
                auctionId: id,
                bidValue: nextBid,
            }),
        );
    }
}
