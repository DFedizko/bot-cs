import type { Logger } from "@/packages/application/logger";

export class LoggerConsoleAdapter implements Logger {
    log(message: string): void {
        console.log(message);
    }
}
