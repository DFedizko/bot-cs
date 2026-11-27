import { IntegrationEvent } from "@/packages/building-blocks/integration-event";

export type FooHappenedPayload = { fooId: number; tags: string[] };

export class FooHappenedIntegrationEvent extends IntegrationEvent<FooHappenedPayload> {
    static readonly EVENT_NAME = "foo_happened";

    constructor(payload: FooHappenedPayload) {
        super({ name: FooHappenedIntegrationEvent.EVENT_NAME, payload });
    }
}

export const fooHappenedPayload = (): FooHappenedPayload => ({ fooId: 1, tags: ["first"] });
