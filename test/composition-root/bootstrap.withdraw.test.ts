import { buildWantedItem } from "@/contexts/trading/bidding/domain/wanted-item/__builders__/wanted-item.builder";
import type { Container } from "inversify";
import { Bootstrap } from "@/composition-root/bootstrap";
import { testContainer } from "@/__builders__/test-container.builder";
import { COMMAND_BUS, HTTP_SERVER, LOGGER } from "@/packages/external/di/packages.identifiers";
import {
    ACCOUNT_REPOSITORY,
    CSGOEMPIRE_TRADE_HTTP,
    WANTED_ITEM_REPOSITORY,
} from "@/contexts/trading/bidding/external/di/bidding.identifiers";
import { Account } from "@/contexts/trading/bidding/domain/account/account";
import { AccountId } from "@/contexts/shared-kernel/domain/account-id";
import { maxForPercentage } from "@/contexts/trading/bidding/domain/wanted-item/__builders__/max-for.builder";
import { evaluateItemCommand } from "@/contexts/trading/bidding/application/evaluate-item/__mocks__/evaluate-item.command.mock";

const DRY_RUN_ENV = "development";
const OFF_AUCTION = false;
const BUYER_BALANCE = 10_000;
const BUYER_NAME = "John Doe";
const { itemId, accountId, itemName, price, aboveRecommendedPercentage } = evaluateItemCommand(OFF_AUCTION);

const approvedOffAuctionItem = async (container: Container): Promise<void> => {
    await container
        .get(ACCOUNT_REPOSITORY)
        .save(Account.sync({ id: accountId, name: BUYER_NAME, totalAmount: BUYER_BALANCE }));
    await container
        .get(WANTED_ITEM_REPOSITORY)
        .save(buildWantedItem({ accountId, name: itemName, maxFor: maxForPercentage(aboveRecommendedPercentage) }));
};

const evaluateOffAuctionItem = async (container: Container): Promise<void> => {
    await new Bootstrap(container).run();
    await approvedOffAuctionItem(container);
    await (await container.getAsync(COMMAND_BUS)).dispatch(evaluateItemCommand(OFF_AUCTION));
};

let container: Container;

describe("Bootstrap withdrawal", () => {
    beforeEach(() => {
        container = testContainer(DRY_RUN_ENV);
    });

    afterEach(async () => {
        await container.get(HTTP_SERVER).close();
    });

    it("Should log the dry-run withdrawal of an approved off-auction item before the evaluation resolves", async () => {
        const logSpy = jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});

        await evaluateOffAuctionItem(container);

        expect(logSpy).toHaveBeenCalledWith(`Dry run: skipped a withdrawal of item "${itemId}" for ${price}`);
    });

    it("Should reserve the item's price on the account", async () => {
        jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});

        await evaluateOffAuctionItem(container);

        const account = await container.get(ACCOUNT_REPOSITORY).findById(new AccountId(accountId));
        expect(account?.getReservedAmount()).toBe(price);
    });

    it("Should never withdraw the item on csgoempire", async () => {
        jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});
        const withdrawSpy = jest.spyOn(container.get(CSGOEMPIRE_TRADE_HTTP), "createWithdrawal");

        await evaluateOffAuctionItem(container);

        expect(withdrawSpy).not.toHaveBeenCalled();
    });
});
