import type { EventBus } from "@/packages/application/event-bus";
import { SkinListedEventListener } from "./application/evaluate-item/evaluate-item.command-handler";
import { WantedSkinRepositoryInMemory } from "./infrastructure/repositories/wanted-skin.repository.in-memory";
import type { CommandBus } from "@/packages/application/command-bus";
import type { Logger } from "@/packages/application/logger";

const wantedSkinRepo = new WantedSkinRepositoryInMemory();

export const registerBiddingEvents = (eventBus: EventBus, commandBus: CommandBus, logger: Logger): void => {
    const skinListedEventListener = new SkinListedEventListener(wantedSkinRepo, logger, commandBus);
    eventBus.addSubscribers([skinListedEventListener]);
};
