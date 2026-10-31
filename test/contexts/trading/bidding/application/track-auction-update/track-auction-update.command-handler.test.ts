import type { TrackAuctionUpdateCommand } from "@/contexts/trading/bidding/application/track-auction-update/track-auction-update.command";
import { AccountRepositoryInMemory } from "@/contexts/trading/bidding/infrastructure/repositories/account.repository.in-memory";
import type { EventBus } from "@/packages/application/event-bus";
import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import { EventBusInMemoryAsync } from "@/packages/external/event-bus/event-bus.in-memory-async";
import { trackAuctionUpdateCommand } from "./__mocks__/track-auction-update.command.mock";
import { Account } from "@/contexts/trading/bidding/domain/account/account";
import type { Mock } from "bun:test";
import type { OutbidEvent } from "@/contexts/trading/bidding/application/track-auction-update/outbid.event";
import type { AccountRepository } from "@/contexts/trading/bidding/application/account.repository";
import { AccountId } from "@/contexts/trading/bidding/domain/account/account-id";
import { TrackAuctionUpdateCommandHandler } from "@/contexts/trading/bidding/application/track-auction-update/track-auction-update.command-handler";

let accountRepository: AccountRepository;
let eventBus: EventBus;
let publishSpy: Mock<EventBus["publish"]>;
let trackAuctionUpdateCommandHandler: CommandHandler<TrackAuctionUpdateCommand>;
describe("TrackAuctionUpdateCommandHandler", () => {
    beforeEach(async () => {
        accountRepository = new AccountRepositoryInMemory();
        eventBus = new EventBusInMemoryAsync();
        publishSpy = jest.spyOn(eventBus, "publish");
        trackAuctionUpdateCommandHandler = new TrackAuctionUpdateCommandHandler(accountRepository, eventBus);

        await accountRepository.save(Account.sync({ id: 1, name: "John Doe", totalAmount: 20000 }));
    });

    it("Should verify if the update is an outbid", async () => {
        const account = (await accountRepository.findById(new AccountId(1))) as Account;
        account.reserveFor(1, 20000);
        await accountRepository.save(account);
        const command = trackAuctionUpdateCommand();
        await trackAuctionUpdateCommandHandler.handle(command);
        const accountAfterCommand = (await accountRepository.findById(new AccountId(1))) as Account;
        const [[event]] = publishSpy.mock.calls[0] as [[OutbidEvent]];
        expect(accountAfterCommand.getTotalAmount()).toBe(20000);
        expect(accountAfterCommand.getAvailableAmount()).toBe(20000);
        expect(accountAfterCommand.getReservedAmount()).toBe(0);
        expect(publishSpy).toHaveBeenCalledTimes(1);
        expect(event.payload.auctionId).toBe(command.auctionId);
        expect(event.payload.bidderId).toBe(command.bidderId);
        expect(event.payload.value).toBe(command.value);
        expect(event.payload.endsAt).toBe(command.endsAt);
    });
    it("Should ignore an auction update and not publish an outbid event when the highest bidder has the same id as one of the accounts", async () => {
        const account = (await accountRepository.findById(new AccountId(1))) as Account;
        account.reserveFor(1, 20000);
        await accountRepository.save(account);
        await trackAuctionUpdateCommandHandler.handle(trackAuctionUpdateCommand({ bidderId: 1 }));
        expect(publishSpy).toHaveBeenCalledTimes(0);
    });
    it("Should igonre an auction update and not publish an outbid event when no accounts has a reservation for this bid", async () => {
        await trackAuctionUpdateCommandHandler.handle(trackAuctionUpdateCommand());
        expect(publishSpy).toHaveBeenCalledTimes(0);
    });
});
