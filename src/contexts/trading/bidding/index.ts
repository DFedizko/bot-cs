import type { EventBus } from "@/packages/application/event-bus";
import { WantedItemRepositoryInMemory } from "./infrastructure/repositories/wanted-skin.repository.in-memory";
import type { CommandBus } from "@/packages/application/command-bus";
import type { Logger } from "@/packages/application/logger";
import { EvaluateItemCommandHandler } from "./application/evaluate-item/evaluate-item.command-handler";

const wantedSkinRepo = new WantedItemRepositoryInMemory();

export const registerBiddingEvents = (eventBus: EventBus, commandBus: CommandBus, logger: Logger): void => {
    const skinListedEventListener = new EvaluateItemCommandHandler(wantedSkinRepo, logger, eventBus);
    commandBus.register(skinListedEventListener);
};
