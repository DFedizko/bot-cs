import type { Container } from "inversify";
import { trackAuctionUpdateCommand } from "./__mocks__/track-auction-update.command.mock";
import { Account } from "@/contexts/trading/bidding/domain/account/account";
import type { OutbidEvent } from "@/contexts/trading/bidding/application/track-auction-update/outbid.event";
import { AccountId } from "@/contexts/shared-kernel/domain/account-id";
import { testContainer } from "@/__builders__/test-container.builder";
import { EVENT_BUS } from "@/packages/external/di/packages.identifiers";
import { ACCOUNT_REPOSITORY, TRACK_AUCTION_HANDLER } from "@/contexts/trading/bidding/external/di/bidding.identifiers";

let container: Container;

describe("TrackAuctionUpdateCommandHandler", () => {
    beforeEach(async () => {
        container = testContainer();
        await container.get(ACCOUNT_REPOSITORY).save(Account.sync({ id: 1, name: "John Doe", totalAmount: 20000 }));
    });

    it("Should verify if the update is an outbid", async () => {
        const accountRepository = container.get(ACCOUNT_REPOSITORY);
        const account = (await accountRepository.findById(new AccountId(1))) as Account;
        account.reserveFor(1, 20000);
        await accountRepository.save(account);
        const publishSpy = jest.spyOn(container.get(EVENT_BUS), "publish");
        const command = trackAuctionUpdateCommand();

        await container.get(TRACK_AUCTION_HANDLER).handle(command);

        const accountAfterCommand = (await accountRepository.findById(new AccountId(1))) as Account;
        const [[event]] = publishSpy.mock.calls[0] as [[OutbidEvent]];
        expect(accountAfterCommand.getTotalAmount()).toBe(20000);
        expect(accountAfterCommand.getAvailableAmount()).toBe(20000);
        expect(accountAfterCommand.getReservedAmount()).toBe(0);
        expect(publishSpy).toHaveBeenCalledTimes(1);
        expect(event.payload.auctionId).toBe(command.auctionId);
        expect(event.payload.accountId).toBe(command.accountId);
        expect(event.payload.value).toBe(command.value);
        expect(event.payload.endsAt).toBe(command.endsAt);
    });
    it("Should ignore an auction update and not publish an outbid event when the highest bidder has the same id as one of the accounts", async () => {
        const accountRepository = container.get(ACCOUNT_REPOSITORY);
        const account = (await accountRepository.findById(new AccountId(1))) as Account;
        account.reserveFor(1, 20000);
        await accountRepository.save(account);
        const publishSpy = jest.spyOn(container.get(EVENT_BUS), "publish");

        await container.get(TRACK_AUCTION_HANDLER).handle(trackAuctionUpdateCommand({ bidderId: 1 }));

        expect(publishSpy).toHaveBeenCalledTimes(0);
    });
    it("Should igonre an auction update and not publish an outbid event when no accounts has a reservation for this bid", async () => {
        const publishSpy = jest.spyOn(container.get(EVENT_BUS), "publish");

        await container.get(TRACK_AUCTION_HANDLER).handle(trackAuctionUpdateCommand());

        expect(publishSpy).toHaveBeenCalledTimes(0);
    });
});
