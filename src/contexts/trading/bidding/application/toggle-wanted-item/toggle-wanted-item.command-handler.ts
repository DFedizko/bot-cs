import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import { ToggleWantedItemCommand } from "./toggle-wanted-item.command";
import type { WantedItemRepository } from "../wanted-item.repository";
import type { WantedItem } from "../../domain/wanted-item/wanted-item";
import { ItemName } from "../../domain/wanted-item/item-name";
import { AccountId } from "../../domain/account/account-id";
import { WantedItemNotFoundError } from "../../domain/wanted-item/errors/wanted-item-not-found.error";

export class ToggleWantedItemCommandHandler implements CommandHandler<ToggleWantedItemCommand> {
    constructor(private readonly wantedItemRepo: WantedItemRepository) {}

    subscribedTo(): string {
        return ToggleWantedItemCommand.COMMAND_NAME;
    }

    async handle({ accountId, itemName, enabled }: ToggleWantedItemCommand): Promise<void> {
        const wantedItem = await this.findWantedItem(new AccountId(accountId), new ItemName(itemName));
        this.switchTo(wantedItem, enabled);
        await this.wantedItemRepo.save(wantedItem);
    }

    private switchTo(wantedItem: WantedItem, enabled: boolean): void {
        if (enabled) return wantedItem.enable();
        wantedItem.disable();
    }

    private async findWantedItem(accountId: AccountId, itemName: ItemName): Promise<WantedItem> {
        const wantedItem = await this.wantedItemRepo.findByName(accountId, itemName);
        if (!wantedItem) throw new WantedItemNotFoundError(accountId.getValue(), itemName.getValue());
        return wantedItem;
    }
}
