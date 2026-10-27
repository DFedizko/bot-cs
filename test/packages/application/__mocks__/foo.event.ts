import { Event } from "@/packages/building-blocks/event";

export class FooEvent extends Event {
    static readonly EVENT_NAME = "foo_event_sent";

    constructor() {
        super({ name: FooEvent.EVENT_NAME });
    }
}
