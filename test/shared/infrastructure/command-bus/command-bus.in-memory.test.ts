import { FooCommand } from "@/shared/building-blocks/__mocks__/foo.command";
import { FooRepository } from "@/shared/building-blocks/__mocks__/foo.repository";
import { Command } from "@/shared/building-blocks/command";
import type { CommandHandler } from "@/shared/building-blocks/command-handler";
import { CommandBus } from "@/shared/infrastructure/command-bus/command-bus";
import { CommandBusInMemory } from "@/shared/infrastructure/command-bus/command-bus.in-memory";
import { CommandHandlers } from "@/shared/infrastructure/command-bus/command-handlers";

let fooRepository: FooRepository;
let command: Command;
let commandHandler: CommandHandler<Command>;
let commandHandlers: CommandHandlers;
let commandBus: CommandBus;
beforeEach(() => {
    fooRepository = { save: jest.fn() };
    command = new FooCommand();
    commandHandler = {
        handle: jest.fn(async (command: Command) => {
            fooRepository.save();
        }),
        subscribedTo: () => command.name,
    };
    commandHandlers = new CommandHandlers([commandHandler]);
    commandBus = new CommandBusInMemory(commandHandlers);
});
describe("CommandBusInMemory", () => {
    it("Should dispatch a command", async () => {
        await commandBus.dispatch(command);
        expect(commandHandler.handle).toHaveBeenCalledWith(command);
        expect(fooRepository.save).toHaveBeenCalledTimes(1);
    });
});
