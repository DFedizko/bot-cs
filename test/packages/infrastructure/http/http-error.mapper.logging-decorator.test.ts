import { HttpErrorMapperLoggingDecorator } from "@/packages/infrastructure/http/http-error.mapper.logging-decorator";
import { HttpErrorMapperByErrorClass } from "@/packages/infrastructure/http/http-error.mapper.by-error-class";
import { LoggerConsoleAdapter } from "@/packages/infrastructure/logger/logger.console-adapter";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import { EmptyStringError } from "@/packages/error/empty-string.error";
import { FooInternalError } from "./__stubs__/foo.errors";

const createMapper = (logger: LoggerConsoleAdapter) =>
    new HttpErrorMapperLoggingDecorator(new HttpErrorMapperByErrorClass(), logger);

describe("HttpErrorMapperLoggingDecorator", () => {
    it("Should log the stack of an error mapped to a server error", () => {
        const logger = new LoggerConsoleAdapter();
        const logSpy = jest.spyOn(logger, "log").mockImplementation(() => {});
        const error = new TypeError("Cannot read properties of undefined");

        createMapper(logger).map(error);

        expect(logSpy).toHaveBeenCalledWith(error.stack);
    });

    it("Should log a thrown value that is not an error", () => {
        const logger = new LoggerConsoleAdapter();
        const logSpy = jest.spyOn(logger, "log").mockImplementation(() => {});

        createMapper(logger).map("boom");

        expect(logSpy).toHaveBeenCalledWith("boom");
    });

    it("Should not log an error mapped to a client error", () => {
        const logger = new LoggerConsoleAdapter();
        const logSpy = jest.spyOn(logger, "log").mockImplementation(() => {});

        createMapper(logger).map(new EmptyStringError());

        expect(logSpy).not.toHaveBeenCalled();
    });

    it("Should answer with the response of the decorated mapper", () => {
        const logger = new LoggerConsoleAdapter();
        jest.spyOn(logger, "log").mockImplementation(() => {});

        const response = createMapper(logger).map(new FooInternalError());

        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });
});
