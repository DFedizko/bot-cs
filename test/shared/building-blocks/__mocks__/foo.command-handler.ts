import { CommandHandler } from "@/shared/building-blocks/command-handler";
import { FooCommand } from "./foo.command";
import { FooRepository } from "./foo.repository";

export class FooCommandHandler implements CommandHandler<FooCommand> {
    constructor(private readonly fooRepository: FooRepository) {}

    subscribedTo(): string {
        return FooCommand.COMMAND_NAME;
    }

    async handle(command: FooCommand): Promise<void> {
        await this.fooRepository.save();
    }
}
