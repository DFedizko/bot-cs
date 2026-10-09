import { Event } from "@/shared/building-blocks/event";

export class UpdatedEvent extends Event {
    protected static EVENT_NAME = "event_updated";

    constructor() {
        super({ name: UpdatedEvent.EVENT_NAME });
    }
}
