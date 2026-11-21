import { EventEmitter } from "node:events";
import type { Logger } from "@/packages/application/logger";
import { UnhandledErrorTrapLoggingAdapter } from "@/packages/infrastructure/process/unhandled-error-trap.logging-adapter";

const UNHANDLED_REJECTION = "unhandledRejection";
const FAILURE = "bid rejected";

const silentLogger = (): Logger => ({ log: jest.fn(), debug: jest.fn() });

describe("UnhandledErrorTrapLoggingAdapter", () => {
    it("Should log the stack of an unhandled rejection", () => {
        const events = new EventEmitter();
        const logger = silentLogger();
        const error = new Error(FAILURE);
        new UnhandledErrorTrapLoggingAdapter(events, logger).install();

        events.emit(UNHANDLED_REJECTION, error);

        expect(logger.log).toHaveBeenCalledWith(`Unhandled rejection: ${error.stack}`);
    });

    it("Should log an unhandled rejection that is not an error", () => {
        const events = new EventEmitter();
        const logger = silentLogger();
        new UnhandledErrorTrapLoggingAdapter(events, logger).install();

        events.emit(UNHANDLED_REJECTION, FAILURE);

        expect(logger.log).toHaveBeenCalledWith(`Unhandled rejection: ${FAILURE}`);
    });

    it("Should not listen before it is installed", () => {
        const events = new EventEmitter();

        new UnhandledErrorTrapLoggingAdapter(events, silentLogger());

        expect(events.listenerCount(UNHANDLED_REJECTION)).toBe(0);
    });
});
