import { Event } from "@/packages/building-blocks/event";

export class UpdatedEvent extends Event {
    static readonly EVENT_NAME = "event_updated";

    constructor() {
        super({ name: UpdatedEvent.EVENT_NAME });
    }
}
