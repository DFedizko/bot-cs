import type { EventBus } from "@/shared/application/event-bus";
import { SkinListedEventListener } from "./application/event-listeners/skin-listed.event-listener";
import { WantedSkinRepositoryInMemory } from "./infrastructure/repositories/wanted-skin.repository.in-memory";
import type { CommandBus } from "@/shared/infrastructure/command-bus/command-bus";
import type { Logger } from "@/shared/application/logger";

const wantedSkinRepo = new WantedSkinRepositoryInMemory();

export const registerBiddingEvents = (eventBus: EventBus, commandBus: CommandBus, logger: Logger): void => {
    const skinListedEventListener = new SkinListedEventListener(wantedSkinRepo, logger, commandBus);
    eventBus.addSubscribers([skinListedEventListener]);
};
