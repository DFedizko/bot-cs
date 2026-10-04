import { CommandHandler } from "@/shared/building-blocks/command-handler";
import { FooCommand } from "./foo.command";

export class FooCommandHandler implements CommandHandler<FooCommand> {
    subscribedTo(): FooCommand {
        return new FooCommand();
    }

    async handle(command: FooCommand): Promise<void> {
        console.log(command.name);
    }
}
