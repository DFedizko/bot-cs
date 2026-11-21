import type { Logger } from "@/packages/application/logger";
import type { ProcessEvents } from "./process-events";
import type { UnhandledErrorTrap } from "./unhandled-error-trap";

export class UnhandledErrorTrapLoggingAdapter implements UnhandledErrorTrap {
    constructor(
        private readonly events: ProcessEvents,
        private readonly logger: Logger,
    ) {}

    install(): void {
        this.events.on("unhandledRejection", (reason) => this.logRejection(reason));
    }

    private logRejection(reason: unknown): void {
        this.logger.log(`Unhandled rejection: ${this.describe(reason)}`);
    }

    private describe(reason: unknown): string {
        return reason instanceof Error ? (reason.stack ?? reason.message) : String(reason);
    }
}
