import { Event } from "@/packages/building-blocks/event";

export class CreatedEvent extends Event {
    static readonly EVENT_NAME = "created_updated";

    constructor() {
        super({ name: CreatedEvent.EVENT_NAME });
    }
}
