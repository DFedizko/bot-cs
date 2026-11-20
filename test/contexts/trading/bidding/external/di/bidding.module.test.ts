import type { Container } from "inversify";
import { biddingContainer } from "./__builders__/bidding-container.builder";
import { fakeExternals } from "@/__builders__/externals.builder";
import {
    ACCOUNT_REPOSITORY,
    ACTIVE_TRADES_GATEWAY,
    CSGOEMPIRE_AUCTION_HTTP,
    CSGOEMPIRE_TRADE_HTTP,
    NEW_ITEM_CONTROLLER,
    WANTED_ITEM_REPOSITORY,
} from "@/contexts/trading/bidding/external/di/bidding.identifiers";
import { COMMAND_BUS, COMMAND_HANDLER } from "@/packages/external/di/packages.identifiers";
import { CsgoempireAuctionHttpAdapter } from "@/contexts/trading/bidding/external/http/csgoempire/csgoempire-auction.http.adapter";
import { CsgoempireTradeHttpAdapter } from "@/contexts/trading/bidding/external/http/csgoempire/csgoempire-trade.http.adapter";
import { ActiveTradesGatewayCsgAdapter } from "@/contexts/trading/bidding/infrastructure/gateways/active-trades.gateway.csg-adapter";
import { AccountRepositoryInMemory } from "@/contexts/trading/bidding/infrastructure/repositories/account.repository.in-memory";
import { WantedItemRepositoryInMemory } from "@/contexts/trading/bidding/infrastructure/repositories/wanted-item.repository.in-memory";
import { EvaluateItemCommandHandler } from "@/contexts/trading/bidding/application/evaluate-item/evaluate-item.command-handler";
import { SynchronizeAccountCommandHandler } from "@/contexts/trading/bidding/application/synchronize-account/synchronize-account.command-handler";
import { NewItemWsController } from "@/contexts/trading/bidding/infrastructure/controllers/new-item.ws-controller";
import { evaluateItemCommand } from "../../application/evaluate-item/__mocks__/evaluate-item.command.mock";

const ENVIRONMENTS: ("development" | "production")[] = ["development", "production"];

let container: Container;

describe.each(ENVIRONMENTS)("BiddingModule in %s", (nodeEnv) => {
    beforeEach(() => {
        container = biddingContainer(nodeEnv);
    });

    it("Should bind the csgoempire auction http adapter", () => {
        const auctionHttp = container.get(CSGOEMPIRE_AUCTION_HTTP);

        expect(auctionHttp).toBeInstanceOf(CsgoempireAuctionHttpAdapter);
    });

    it("Should bind the csgoempire trade http adapter", () => {
        const tradeHttp = container.get(CSGOEMPIRE_TRADE_HTTP);

        expect(tradeHttp).toBeInstanceOf(CsgoempireTradeHttpAdapter);
    });

    it("Should bind the csgoempire active trades gateway", () => {
        const activeTradesGateway = container.get(ACTIVE_TRADES_GATEWAY);

        expect(activeTradesGateway).toBeInstanceOf(ActiveTradesGatewayCsgAdapter);
    });

    it("Should bind the in-memory account repository", () => {
        const accountRepository = container.get(ACCOUNT_REPOSITORY);

        expect(accountRepository).toBeInstanceOf(AccountRepositoryInMemory);
    });

    it("Should bind the in-memory wanted item repository", () => {
        const wantedItemRepository = container.get(WANTED_ITEM_REPOSITORY);

        expect(wantedItemRepository).toBeInstanceOf(WantedItemRepositoryInMemory);
    });

    it("Should bind the bidding command handlers", async () => {
        const handlers = await fakeExternals(container).getAllAsync(COMMAND_HANDLER);

        expect(handlers).toEqual([
            expect.any(EvaluateItemCommandHandler),
            expect.any(SynchronizeAccountCommandHandler),
        ]);
    });

    it("Should register the bidding command handlers on the command bus", async () => {
        const commandBus = await fakeExternals(container).getAsync(COMMAND_BUS);

        await expect(commandBus.dispatch(evaluateItemCommand())).resolves.toBeUndefined();
    });

    it("Should bind the new item controller to the ws client", async () => {
        const controller = await fakeExternals(container).getAsync(NEW_ITEM_CONTROLLER);

        expect(controller).toBeInstanceOf(NewItemWsController);
    });
});
