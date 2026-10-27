import { FooCommand } from "@/packages/building-blocks/__mocks__/foo.command";
import { FooRepository } from "@/packages/building-blocks/__mocks__/foo.repository";
import { Command } from "@/packages/building-blocks/command";
import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import { CommandBus } from "@/packages/infrastructure/command-bus/command-bus";
import { CommandBusInMemory } from "@/packages/external/command-bus/command-bus.in-memory";
import { CommandHandlers } from "@/packages/infrastructure/command-bus/command-handlers";

let fooRepository: FooRepository;
let command: Command;
let commandHandler: CommandHandler<Command>;
let commandHandlers: CommandHandlers;
let commandBus: CommandBus;
beforeEach(() => {
    fooRepository = { save: jest.fn() };
    command = new FooCommand();
    commandHandler = {
        handle: jest.fn(async () => {
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
