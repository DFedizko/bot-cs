import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import { RemoveWantedItemCommand } from "./remove-wanted-item.command";
import type { WantedItemRepository } from "../wanted-item.repository";
import { MarketHashName } from "@/contexts/shared-kernel/domain/market-hash-name";
import { AccountId } from "@/contexts/shared-kernel/domain/account-id";
import { WantedItemNotFoundError } from "../../domain/wanted-item/errors/wanted-item-not-found.error";

export class RemoveWantedItemCommandHandler implements CommandHandler<RemoveWantedItemCommand> {
    constructor(private readonly wantedItemRepo: WantedItemRepository) {}

    subscribedTo(): string {
        return RemoveWantedItemCommand.COMMAND_NAME;
    }

    async handle(command: RemoveWantedItemCommand): Promise<void> {
        const accountId = new AccountId(command.accountId);
        const itemName = new MarketHashName(command.itemName);
        await this.rejectMissingItem(accountId, itemName);
        await this.wantedItemRepo.removeByName(accountId, itemName);
    }

    private async rejectMissingItem(accountId: AccountId, itemName: MarketHashName): Promise<void> {
        const wantedItem = await this.wantedItemRepo.findByName(accountId, itemName);
        if (!wantedItem) throw new WantedItemNotFoundError(accountId.getValue(), itemName.getValue());
    }
}
