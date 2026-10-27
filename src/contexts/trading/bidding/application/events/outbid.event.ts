import { ApplicationEvent } from "@/packages/building-blocks/application-event";

type Payload = {
    id: number;
    bidderId: number;
    value: number;
    endsAt: number;
};

export class OutbidEvent extends ApplicationEvent<Payload> {
    static readonly EVENT_NAME = "outbid";

    constructor(payload: Payload) {
        super({ payload, name: OutbidEvent.EVENT_NAME });
    }
}
