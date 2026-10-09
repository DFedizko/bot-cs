import { Event } from "./event";

export class ApplicationEvent<TPayload = undefined> extends Event<TPayload> {}
