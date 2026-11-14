import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import { AddWantedItemCommand } from "./add-wanted-item.command";
import type { WantedItemRepository } from "../wanted-item.repository";
import { WantedItem } from "../../domain/wanted-item/wanted-item";

export class AddWantedItemCommandHandler implements CommandHandler<AddWantedItemCommand> {
    constructor(private readonly wantedItemRepo: WantedItemRepository) {}

    subscribedTo(): string {
        return AddWantedItemCommand.COMMAND_NAME;
    }

    async handle({ name, maxFor, criteria }: AddWantedItemCommand): Promise<void> {
        const wantedItem = WantedItem.create({ name, maxFor, criteria });
        await this.wantedItemRepo.save(wantedItem);
    }
}
