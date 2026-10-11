import type { EventListener } from "@/shared/application/event-listener";
import { SkinListedEvent } from "../events/skin-listed.event";
import type { CommandBus } from "@/shared/infrastructure/command-bus/command-bus";
import type { DesiredSkinRepository } from "../repositories/desired-skin.repository";
import { PlaceBidCommand } from "../commands/place-bid.command";
import { BidIncrementer } from "../../domain/services/bid-incrementer";
import type { Logger } from "@/shared/application/logger";

export class SkinListedEventListener implements EventListener<SkinListedEvent> {
    constructor(
        private readonly desiredSkinRepository: DesiredSkinRepository,
        private readonly logger: Logger,
        private readonly commandBus: CommandBus,
    ) {}

    subscribedTo(): string {
        return SkinListedEvent.EVENT_NAME;
    }

    async on(event: SkinListedEvent): Promise<void> {
        const { id, name, aboveRecommendedPercentage, price, numberOfBids } = event.payload;
        const desiredSkin = await this.desiredSkinRepository.findByName(name);
        if (!desiredSkin) return;
        const shouldBuy = desiredSkin.criterias.some((criteria) => criteria.isSatisfiedBy(aboveRecommendedPercentage));
        if (!shouldBuy)
            return this.logger.log(`The item "${name}" did not meet criterion "IsEqualAboveRecommendedSpecification"`);
        const nextBid = BidIncrementer.nextFor({ value: price, numberOfBids });
        await this.commandBus.dispatch(
            new PlaceBidCommand({
                auctionId: id,
                bidValue: nextBid,
            }),
        );
    }
}
