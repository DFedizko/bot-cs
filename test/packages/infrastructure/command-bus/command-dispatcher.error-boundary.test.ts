import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import type { Logger } from "@/packages/application/logger";
import { CommandBusInMemory } from "@/packages/infrastructure/command-bus/command-bus.in-memory";
import { CommandDispatcherErrorBoundary } from "@/packages/infrastructure/command-bus/command-dispatcher.error-boundary";
import { FooCommand } from "@/packages/building-blocks/__mocks__/foo.command";

const FAILURE = "auction ended";
const ITEM_ID = 288767047;
const ACCOUNT_ID = 1;
const CONTEXT = { itemId: ITEM_ID, accountId: ACCOUNT_ID };

const fooHandler = (handle: () => Promise<void>): CommandHandler<FooCommand> => ({
    subscribedTo: () => FooCommand.COMMAND_NAME,
    handle,
});
const failingHandler = () =>
    fooHandler(async () => {
        throw new Error(FAILURE);
    });
const silentLogger = (): Logger => ({ log: jest.fn(), debug: jest.fn() });

describe("CommandDispatcherErrorBoundary", () => {
    it("Should dispatch the command on the command bus", async () => {
        const handler = fooHandler(jest.fn(async () => {}));
        const commandBus = new CommandBusInMemory();
        commandBus.register(handler);
        const dispatcher = new CommandDispatcherErrorBoundary(commandBus, silentLogger());

        await dispatcher.dispatch(new FooCommand(), CONTEXT);

        expect(handler.handle).toHaveBeenCalledWith(new FooCommand());
    });

    it("Should resolve when the command fails", async () => {
        const commandBus = new CommandBusInMemory();
        commandBus.register(failingHandler());
        const dispatcher = new CommandDispatcherErrorBoundary(commandBus, silentLogger());

        const dispatching = dispatcher.dispatch(new FooCommand(), CONTEXT);

        await expect(dispatching).resolves.toBeUndefined();
    });

    it("Should log the failed command with its name, context and error stack", async () => {
        const logger = silentLogger();
        const error = new Error(FAILURE);
        const commandBus = new CommandBusInMemory();
        commandBus.register(fooHandler(() => Promise.reject(error)));
        const dispatcher = new CommandDispatcherErrorBoundary(commandBus, logger);

        await dispatcher.dispatch(new FooCommand(), CONTEXT);

        expect(logger.log).toHaveBeenCalledWith(
            `Command "${FooCommand.COMMAND_NAME}" failed (itemId=${ITEM_ID}, accountId=${ACCOUNT_ID}): ${error.stack}`,
        );
    });

    it("Should log a failure that is not an error", async () => {
        const logger = silentLogger();
        const commandBus = new CommandBusInMemory();
        commandBus.register(fooHandler(() => Promise.reject(FAILURE)));
        const dispatcher = new CommandDispatcherErrorBoundary(commandBus, logger);

        await dispatcher.dispatch(new FooCommand(), CONTEXT);

        expect(logger.log).toHaveBeenCalledWith(expect.stringMatching(new RegExp(`: ${FAILURE}$`)));
    });
});
