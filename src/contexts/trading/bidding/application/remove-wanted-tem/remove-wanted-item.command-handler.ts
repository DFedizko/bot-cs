import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import { RemoveWantedItemCommand } from "./remove-wanted-item.command";
import type { WantedItemRepository } from "../wanted-item.repository";
import { ItemName } from "../../domain/wanted-item/item-name";

export class RemoveWantedItemCommandHandler implements CommandHandler<RemoveWantedItemCommand> {
    constructor(private readonly wantedItemRepo: WantedItemRepository) {}

    subscribedTo(): string {
        return RemoveWantedItemCommand.COMMAND_NAME;
    }

    async handle(command: RemoveWantedItemCommand): Promise<void> {
        await this.wantedItemRepo.removeByName(new ItemName(command.itemName));
    }
}
