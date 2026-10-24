import type { Logger } from "@/shared/application/logger";

export class LoggerConsoleAdapter implements Logger {
    log(message: string): void {
        console.log(message);
    }
}
