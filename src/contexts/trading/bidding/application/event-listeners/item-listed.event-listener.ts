import type { EventListener } from "@/shared/application/event-listener";
import { ItemListedEvent } from "../events/item-listed.event";

export class ItemListedEventListener implements EventListener {
    subscribedTo(): string {
        return "";
    }

    async on(event: ItemListedEvent): Promise<void> {}
}
