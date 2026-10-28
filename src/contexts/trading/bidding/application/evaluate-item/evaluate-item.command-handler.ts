import { BidIncrementer } from "../../domain/auction/bid-incrementer";
import type { Logger } from "@/packages/application/logger";
import type { WantedSkinRepository } from "../repositories/wanted-skin.repository";
import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import { EvaluateItemCommand } from "./evaluate-item.command";
import type { EventBus } from "@/packages/application/event-bus";
import { ItemEvaluatedEvent } from "../events/item-evaluated.event";
import { nativeEnum } from "zod/v3";

export class EvaluateItemCommandHandler implements CommandHandler<EvaluateItemCommand> {
    constructor(
        private readonly wantedSkinRepository: WantedSkinRepository,
        private readonly logger: Logger,
        private readonly eventBus: EventBus,
    ) {}

    subscribedTo(): string {
        return EvaluateItemCommand.COMMAND_NAME;
    }

    async handle(command: EvaluateItemCommand): Promise<void> {
		const { id, itemName, aboveRecommendedPercentage, price, numberOfBids, inAuction } = command;
        if (!inAuction) return;
        const wantedSkin = await this.wantedSkinRepository.findByName(itemName);
        if (!wantedSkin) return;
        const decision = wantedSkin.evaluate({ value: price, aboveRecommendedPercentage });
        if (!decision.approved) return this.logger.log(decision.failures.join("; "));
		const nextBid = BidIncrementer.nextFor({ value: price, numberOfBids });
        await this.eventBus.publish([
            new ItemEvaluatedEvent({
                auctionId: id,
                value: nextBid,
            }),
        ]);
    }
}
