import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import { EditWantedItemCommand } from "./edit-wanted-item.command";
import type { WantedItemRepository } from "../wanted-item.repository";
import type { WantedItem } from "../../domain/wanted-item/wanted-item";
import { ItemName } from "../../domain/wanted-item/item-name";
import { AccountId } from "@/contexts/shared-kernel/domain/account-id";
import { WantedItemNotFoundError } from "../../domain/wanted-item/errors/wanted-item-not-found.error";

export class EditWantedItemCommandHandler implements CommandHandler<EditWantedItemCommand> {
    constructor(private readonly wantedItemRepo: WantedItemRepository) {}

    subscribedTo(): string {
        return EditWantedItemCommand.COMMAND_NAME;
    }

    async handle({ accountId, itemName, maxFor, criteria }: EditWantedItemCommand): Promise<void> {
        const wantedItem = await this.findWantedItem(new AccountId(accountId), new ItemName(itemName));
        wantedItem.edit({ maxFor, criteria });
        await this.wantedItemRepo.save(wantedItem);
    }

    private async findWantedItem(accountId: AccountId, itemName: ItemName): Promise<WantedItem> {
        const wantedItem = await this.wantedItemRepo.findByName(accountId, itemName);
        if (!wantedItem) throw new WantedItemNotFoundError(accountId.getValue(), itemName.getValue());
        return wantedItem;
    }
}
