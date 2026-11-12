import type { AuctionGateway } from "@/contexts/trading/bidding/application/place-bid/auction.gateway";
import type { ActiveTradesGateway } from "@/contexts/trading/bidding/application/synchronize-account/active-trades.gateway";
import { ActiveTradesGatewayCsgAdapter } from "@/contexts/trading/bidding/infrastructure/gateways/active-trades.gateway.csg-adapter";
import { AuctionGatewayCsgoempireAdapter } from "@/contexts/trading/bidding/infrastructure/gateways/auction.gateway.csgoempire-adapter";
import type { CsgoempireAuctionHttp } from "@/contexts/trading/bidding/infrastructure/http/csgoempire/csgoempire-auction.http";
import type { CsgoempireTradeHttp } from "@/contexts/trading/bidding/infrastructure/http/csgoempire/csgoempire-trade.http";
import { CsgoempireAuctionHttpFakeAdapter } from "../../external/http/csgoempire/csgoempire-auction.http.fake-adapter";
import { CsgoempireTradeHttpFakeAdapter } from "../../external/http/csgoempire/csgoempire-trade.http.fake-adapter";
import type { AccountRepository } from "@/contexts/trading/bidding/application/account.repository";
import { AccountRepositoryInMemory } from "@/contexts/trading/bidding/infrastructure/repositories/account.repository.in-memory";
import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import { SynchronizeAccountCommand } from "@/contexts/trading/bidding/application/synchronize-account/synchronize-account.command";
import type { Logger } from "@/packages/application/logger";
import type { Mock } from "bun:test";
import { LoggerConsoleAdapter } from "@/packages/infrastructure/logger/logger.console-adapter";
import { AccountId } from "@/contexts/trading/bidding/domain/account/account-id";
import { CoinCent } from "@/contexts/trading/shared/domain/coin-cent";
import { SynchronizeAccountCommandHandler } from "@/contexts/trading/bidding/application/synchronize-account/synchronize-account.command-handler";

let csgoempireAuctionHttp: CsgoempireAuctionHttp;
let csgoempireTradeHttp: CsgoempireTradeHttp;
let auctionGateway: AuctionGateway;
let activeTradesGateway: ActiveTradesGateway;
let accountRepo: AccountRepository;
let logger: Logger;
let loggerSpy: Mock<Logger["log"]>;
let synchronizeAccountCommandHandler: CommandHandler<SynchronizeAccountCommand>;
describe("SynchronizeAccountCommandHandler", () => {
    beforeEach(() => {
        csgoempireAuctionHttp = new CsgoempireAuctionHttpFakeAdapter(1);
        csgoempireTradeHttp = new CsgoempireTradeHttpFakeAdapter();
        auctionGateway = new AuctionGatewayCsgoempireAdapter(csgoempireAuctionHttp);
        activeTradesGateway = new ActiveTradesGatewayCsgAdapter(csgoempireTradeHttp);
        accountRepo = new AccountRepositoryInMemory();
        logger = new LoggerConsoleAdapter();
        loggerSpy = jest.spyOn(logger, "log");
        synchronizeAccountCommandHandler = new SynchronizeAccountCommandHandler(
            auctionGateway,
            activeTradesGateway,
            accountRepo,
            logger,
        );
    });

    it("Should fetch data and synchronize the account and auction participations", async () => {
        await synchronizeAccountCommandHandler.handle(new SynchronizeAccountCommand(1, "John Doe", 1000));
        const account = await accountRepo.findById(new AccountId(1));
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
        await synchronizeAccountCommandHandler.handle(new SynchronizeAccountCommand(1, "John Doe", 1000));
        await synchronizeAccountCommandHandler.handle(new SynchronizeAccountCommand(1, "John Doe", 1000));
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
