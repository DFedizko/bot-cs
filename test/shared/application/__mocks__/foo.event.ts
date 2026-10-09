import { Event } from "@/shared/building-blocks/event";

export class FooEvent extends Event {
    protected static EVENT_NAME = "foo_event_sent";

    constructor() {
        super({ name: FooEvent.EVENT_NAME });
    }
}
