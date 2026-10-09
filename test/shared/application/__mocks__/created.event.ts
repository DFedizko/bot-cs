import { Event } from "@/shared/building-blocks/event";

export class CreatedEvent extends Event {
    protected static EVENT_NAME = "created_updated";

    constructor() {
        super({ name: CreatedEvent.EVENT_NAME });
    }
}
