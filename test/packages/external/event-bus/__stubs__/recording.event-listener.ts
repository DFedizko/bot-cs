import type { EventListener } from "@/packages/application/event-listener";

export class RecordingEventListener implements EventListener {
    constructor(
        private readonly eventName: string,
        private readonly label: string,
        private readonly records: string[],
        private readonly reaction: () => Promise<void> = async () => {},
    ) {}

    subscribedTo(): string {
        return this.eventName;
    }

    async on(): Promise<void> {
        await Promise.resolve();
        await this.reaction();
        this.records.push(this.label);
    }
}
