import { PlaceBidCommandHandler } from "@/contexts/trading/application/command-handlers/place-bid.command-handler";
import { PlaceBidCommand } from "@/contexts/trading/application/commands/place-bid.command";
import { CsgoempireGateway } from "@/contexts/trading/application/gateways/csgoempire.gateway";
import type { UserDao } from "@/contexts/trading/shared/application/daos/user.dao";
import { InMemoryUserDao } from "@/contexts/trading/shared/infrastructure/daos/in-memory-user.dao";
import type { CommandHandler } from "@/shared/building-blocks/command-handler";

let csgoempireGateway: CsgoempireGateway;
let handler: CommandHandler<PlaceBidCommand>;
let userDao: UserDao;
beforeEach(() => {
    csgoempireGateway = { placeBid: jest.fn(async (depositId: string, bidValue: number) => {}) };
    handler = new PlaceBidCommandHandler(csgoempireGateway);
    userDao = new InMemoryUserDao();
});

describe("PlaceBidCommandHandler", () => {
    it("Should place a bid", async () => {
        const placeBidCommand = new PlaceBidCommand({ depositId: "1", bidValue: 10000 });
        await handler.handle(placeBidCommand);
        const userBalance = await userDao.getUserBalanceById("1");
        expect(userBalance).toBe(90000);
        expect(csgoempireGateway.placeBid).toHaveBeenCalledTimes(1);
        expect(csgoempireGateway.placeBid).toHaveBeenCalledWith("1", 10000);
    });
});
