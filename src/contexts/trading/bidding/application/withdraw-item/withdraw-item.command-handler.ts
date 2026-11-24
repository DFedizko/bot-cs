import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import type { EventBus } from "@/packages/application/event-bus";
import type { Logger } from "@/packages/application/logger";
import type { AccountRepository } from "../account.repository";
import { AccountId } from "../../domain/account/account-id";
import type { Account } from "../../domain/account/account";
import { AccountNotFoundError } from "../../domain/account/errors/account-not-found.error";
import { WithdrawItemCommand } from "./withdraw-item.command";
import type { WithdrawalDTO, WithdrawalGateway } from "./withdrawal.gateway";
import { WithdrawalRejectedError } from "./withdrawal-rejected.error";
import { ItemWithdrawnEvent } from "./item-withdrawn.event";

export class WithdrawItemCommandHandler implements CommandHandler<WithdrawItemCommand> {
    constructor(
        private readonly accountRepository: AccountRepository,
        private readonly withdrawalGateway: WithdrawalGateway,
        private readonly logger: Logger,
        private readonly eventBus: EventBus,
    ) {}

    subscribedTo(): string {
        return WithdrawItemCommand.COMMAND_NAME;
    }

    async handle(command: WithdrawItemCommand): Promise<void> {
        const account = await this.accountRepository.findById(new AccountId(command.accountId));
        if (!account) throw new AccountNotFoundError(command.accountId);
        if (!account.covers(command.value)) {
            this.logger.log(
                `Couldn't withdraw item "${command.itemId}" because the "${account.getName()}" account has insufficient balance`,
            );
            return;
        }
        account.reserveFor(command.itemId, command.value);
        await this.accountRepository.save(account);
        const withdrawal = await this.withdraw(account, command);
        await this.eventBus.publish([
            new ItemWithdrawnEvent({
                itemId: command.itemId,
                accountId: command.accountId,
                value: command.value,
                tradeId: withdrawal.tradeId,
                tradeOfferId: withdrawal.tradeOfferId,
            }),
        ]);
    }

    private async withdraw(account: Account, command: WithdrawItemCommand): Promise<WithdrawalDTO> {
        try {
            return await this.withdrawalGateway.withdraw(command.itemId, command.value);
        } catch (error: unknown) {
            if (!(error instanceof WithdrawalRejectedError)) return this.confirmWithdrawal(account, command, error);
            await this.refund(account, command.itemId);
            throw error;
        }
    }

    private async confirmWithdrawal(
        account: Account,
        command: WithdrawItemCommand,
        withdrawError: unknown,
    ): Promise<WithdrawalDTO> {
        const withdrawal = await this.findWithdrawal(command, withdrawError);
        if (withdrawal) {
            this.logger.log(`${this.describe(command)} was confirmed, keeping its reservation`);
            return withdrawal;
        }
        this.logger.log(`${this.describe(command)} wasn't made, refunding its reservation`);
        await this.refund(account, command.itemId);
        throw withdrawError;
    }

    private async findWithdrawal(
        command: WithdrawItemCommand,
        withdrawError: unknown,
    ): Promise<WithdrawalDTO | undefined> {
        try {
            return await this.withdrawalGateway.findWithdrawal(command.itemId);
        } catch {
            this.logger.log(
                `Couldn't confirm the withdrawal of item "${command.itemId}" for ${command.value}, keeping its reservation`,
            );
            throw withdrawError;
        }
    }

    private describe(command: WithdrawItemCommand): string {
        return `The withdrawal of item "${command.itemId}" for ${command.value}`;
    }

    private async refund(account: Account, itemId: number): Promise<void> {
        account.refundFor(itemId);
        await this.accountRepository.save(account);
    }
}
