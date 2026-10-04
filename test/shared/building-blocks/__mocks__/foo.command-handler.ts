import { CommandHandler } from "@/shared/building-blocks/command-handler";
import { FooCommand } from "./foo.command";
import { FooRepository } from "./foo.repository";

export class FooCommandHandler implements CommandHandler<FooCommand> {
    constructor(private readonly fooRepository: FooRepository) {}

    subscribedTo(): FooCommand {
        return new FooCommand();
    }

    async handle(command: FooCommand): Promise<void> {
        await this.fooRepository.save();
    }
}
