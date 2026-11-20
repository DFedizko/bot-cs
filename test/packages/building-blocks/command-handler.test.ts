import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import { FooCommand } from "./__mocks__/foo.command";
import { FooCommandHandler } from "./__mocks__/foo.command-handler";

const fooRepository = { save: jest.fn() };
const handler: CommandHandler<FooCommand> = new FooCommandHandler(fooRepository);
const command = new FooCommand();
test("Should hanlde a command", async () => {
    await handler.handle(command);
    expect(handler.subscribedTo()).toEqual(command.name);
    expect(fooRepository.save).toHaveBeenCalledTimes(1);
    expect(fooRepository.save).toHaveBeenCalled();
});
