import { FooCommand } from "./__mocks__/foo.command";
import { FooCommandHandler } from "./__mocks__/foo.command-handler";

const handler = new FooCommandHandler();
const command = new FooCommand();
test("Should hanlde a command", async () => {
    expect(handler.subscribedTo()).toBe(command);
    expect(await handler.handle(command)).toHaveBeenCalled();
});
