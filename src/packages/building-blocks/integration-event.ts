import { ApplicationEvent } from "./application-event";
import type { CreateEventProps } from "./event";

type IntegrationEventProps<TPayload extends object> = { name: string; payload: TPayload };

export abstract class IntegrationEvent<TPayload extends object> extends ApplicationEvent<TPayload> {
    constructor(props: IntegrationEventProps<TPayload>) {
        super({
            ...props,
            payload: IntegrationEvent.deepFreeze(structuredClone(props.payload)),
        } as CreateEventProps<TPayload>);
    }

    private static deepFreeze<T>(value: T): T {
        if (typeof value === "object" && value !== null)
            Object.values(value).forEach((nested) => IntegrationEvent.deepFreeze(nested));
        return Object.freeze(value);
    }
}
