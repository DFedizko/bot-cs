import type { Container } from "inversify";
import { CsgoempireAuctionHttpFakeAdapter } from "../../external/http/csgoempire/csgoempire-auction.http.fake-adapter";
import { testContainer } from "@/__builders__/test-container.builder";
import { LOGGER } from "@/packages/external/di/packages.identifiers";
import {
    ACCOUNT_REPOSITORY,
    CSGOEMPIRE_AUCTION_HTTP,
    SYNC_ACCOUNT_HANDLER,
} from "@/contexts/trading/bidding/external/di/bidding.identifiers";
import { SynchronizeAccountCommand } from "@/contexts/trading/bidding/application/synchronize-account/synchronize-account.command";
import { AccountId } from "@/contexts/trading/bidding/domain/account/account-id";
import { CoinCent } from "@/contexts/trading/shared/domain/coin-cent";

let container: Container;

describe("SynchronizeAccountCommandHandler", () => {
    beforeEach(() => {
        container = testContainer();
    });

    it("Should fetch data and synchronize the account and auction participations", async () => {
        container.rebind(CSGOEMPIRE_AUCTION_HTTP).toConstantValue(new CsgoempireAuctionHttpFakeAdapter(1));
        const loggerSpy = jest.spyOn(container.get(LOGGER), "log");
        const handler = container.get(SYNC_ACCOUNT_HANDLER);

        await handler.handle(new SynchronizeAccountCommand(1, "John Doe", 1000));

        const account = await container.get(ACCOUNT_REPOSITORY).findById(new AccountId(1));
        expect(account?.getId()).toBe(1);
        expect(account?.getName()).toBe("John Doe");
        expect(account?.getTotalAmount()).toBe(18149);
        expect(account?.getReservedAmount()).toBe(17149);
        expect(account?.getAvailableAmount()).toBe(1000);
        // auctions
        expect(account?.hasReservationFor(11204)).toBe(true); // 227
        expect(account?.hasReservationFor(11231)).toBe(true); // 16300
        // withdraws
        expect(account?.hasReservationFor(221232898)).toBe(true); // 245
        expect(account?.hasReservationFor(292353222)).toBe(true); // 197
        expect(loggerSpy).toHaveBeenCalledTimes(1);
        expect(loggerSpy).toHaveBeenCalledWith(
            `Account "${account?.getName()}" synchronized successfully with total balance of ${CoinCent(account!.getTotalAmount())}, reserved balance of ${CoinCent(account!.getReservedAmount())}, available balance of ${CoinCent(account!.getAvailableAmount())}`,
        );
    });
    it("Should fetch data and synchronize the account and auction participations one time, even though the command was called tiwce", async () => {
        container.rebind(CSGOEMPIRE_AUCTION_HTTP).toConstantValue(new CsgoempireAuctionHttpFakeAdapter(1));
        const loggerSpy = jest.spyOn(container.get(LOGGER), "log");
        const handler = container.get(SYNC_ACCOUNT_HANDLER);

        await handler.handle(new SynchronizeAccountCommand(1, "John Doe", 1000));
        await handler.handle(new SynchronizeAccountCommand(1, "John Doe", 1000));

        const accountRepo = container.get(ACCOUNT_REPOSITORY);
        const account = await accountRepo.findById(new AccountId(1));
        const accounts = await accountRepo.findMany();
        expect(accounts.length).toBe(1);
        expect(account?.getId()).toBe(1);
        expect(account?.getName()).toBe("John Doe");
        expect(account?.getTotalAmount()).toBe(18149);
        expect(account?.getReservedAmount()).toBe(17149);
        expect(account?.getAvailableAmount()).toBe(1000);
        expect(account?.hasReservationFor(11204)).toBe(true);
        expect(account?.hasReservationFor(11231)).toBe(true);
        expect(account?.hasReservationFor(221232898)).toBe(true);
        expect(account?.hasReservationFor(292353222)).toBe(true);
        expect(loggerSpy).toHaveBeenCalledTimes(2);
        expect(loggerSpy).toHaveBeenCalledWith(
            `Account "${account?.getName()}" synchronized successfully with total balance of ${CoinCent(account!.getTotalAmount())}, reserved balance of ${CoinCent(account!.getReservedAmount())}, available balance of ${CoinCent(account!.getAvailableAmount())}`,
        );
    });
});
