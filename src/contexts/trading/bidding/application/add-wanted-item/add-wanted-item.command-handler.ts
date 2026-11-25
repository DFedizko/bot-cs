import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import type { Clock } from "@/packages/application/clock";
import { AddWantedItemCommand } from "./add-wanted-item.command";
import type { WantedItemRepository } from "../wanted-item.repository";
import { WantedItem } from "../../domain/wanted-item/wanted-item";
import { WantedItemAlreadyExistsError } from "../../domain/wanted-item/errors/wanted-item-already-exists.error";
import { AccountId } from "../../domain/account/account-id";
import { ItemName } from "../../domain/wanted-item/item-name";

export class AddWantedItemCommandHandler implements CommandHandler<AddWantedItemCommand> {
    constructor(
        private readonly wantedItemRepo: WantedItemRepository,
        private readonly clock: Clock,
    ) {}

    subscribedTo(): string {
        return AddWantedItemCommand.COMMAND_NAME;
    }

    async handle({ accountId, itemName, maxFor, criteria }: AddWantedItemCommand): Promise<void> {
        const wantedItem = WantedItem.create({
            accountId,
            name: itemName,
            maxFor,
            criteria,
            addedAt: this.clock.now(),
        });
        await this.rejectExistingItem(wantedItem);
        await this.wantedItemRepo.save(wantedItem);
    }

    private async rejectExistingItem(wantedItem: WantedItem): Promise<void> {
        const accountId = wantedItem.getAccountId();
        const name = wantedItem.getName();
        const existing = await this.wantedItemRepo.findByName(new AccountId(accountId), new ItemName(name));
        if (existing) throw new WantedItemAlreadyExistsError(accountId, name);
    }
}
