import { LoggerConsoleAdapter } from "@/packages/infrastructure/logger/logger.console-adapter";

const MESSAGE = "Skipped the disabled wanted item";

describe("LoggerConsoleAdapter", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("Should write a message to the console", () => {
        const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

        new LoggerConsoleAdapter().log(MESSAGE);

        expect(consoleSpy).toHaveBeenCalledWith(MESSAGE);
    });

    it("Should write a debug message to the console's debug level", () => {
        const consoleSpy = jest.spyOn(console, "debug").mockImplementation(() => {});

        new LoggerConsoleAdapter().debug(MESSAGE);

        expect(consoleSpy).toHaveBeenCalledWith(MESSAGE);
    });
});
