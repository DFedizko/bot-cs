const fakeCsgoEmpireApi = new FakeCsgoEmpireApi();
const handler = new PlaceBidCommandHandler(fakeCsgoEmpireApi);

const userDao = new InMemoryUserDao();

describe("PlaceBidCommandHandler", () => {
    it("Should place a bid", async () => {
        const placeBidCommand = new PlaceBidCommand(10000);
        await handler.handle(placeBidCommand);
        const userBalance = await userDao.getUserBalanceById("1");
        expect(userBalance).toBe(90000);
    });
});
