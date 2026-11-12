import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import { SynchronizeAccountCommand } from "./synchronize-account.command";
import type { AuctionGateway } from "../place-bid/auction.gateway";
import type { ActiveTradesGateway } from "./active-trades.gateway";
import type { AccountRepository } from "../account.repository";
import type { Logger } from "@/packages/application/logger";
import { Account } from "../../domain/account/account";
import { CoinCent } from "@/contexts/trading/shared/domain/coin-cent";

export class SynchronizeAccountCommandHandler implements CommandHandler<SynchronizeAccountCommand> {
    constructor(
        private readonly auctionGateway: AuctionGateway,
        private readonly activeTradesGateway: ActiveTradesGateway,
        private readonly accountRepo: AccountRepository,
        private readonly logger: Logger,
    ) {}

    subscribedTo(): string {
        return SynchronizeAccountCommand.COMMAND_NAME;
    }

    async handle(command: SynchronizeAccountCommand): Promise<void> {
        try {
            const activeAuctions = await this.auctionGateway.getActiveAuctions();
            const activeTrades = await this.activeTradesGateway.getActiveTrades();
            const account = Account.sync({
                id: command.accountId,
                name: command.accountName,
                totalAmount: command.balance,
            });
            activeAuctions.forEach((auction) => {
                if (account.isMe(auction.bidderId)) {
                    account.credit(auction.highestBid);
                    account.reserveFor(auction.id, auction.highestBid);
                }
            });
            activeTrades.forEach((activeTrade) => {
                account.credit(activeTrade.value);
                account.reserveFor(activeTrade.itemId, activeTrade.value);
            });
            await this.accountRepo.save(account);
            this.logger.log(
                `Account "${account?.getName()}" synchronized successfully with total balance of ${CoinCent(account!.getTotalAmount())}, reserved balance of ${CoinCent(account!.getReservedAmount())}, available balance of ${CoinCent(account!.getAvailableAmount())}`,
            );
        } catch (error: unknown) {
            throw error;
        }
    }
}
