import type { Container } from "inversify";
import { CSGOEMPIRE_HTTP_CLIENT } from "@/contexts/trading/shared/external/di/trading-shared.identifiers";
import { CSGOEMPIRE_TRADE_HTTP } from "@/contexts/trading/bidding/external/di/bidding.identifiers";
import { biddingContainer } from "../../di/__builders__/bidding-container.builder";
import { createWithdrawalRequest, createWithdrawalSuccess } from "./__mocks__/create-withdrawal.mock";
import { activeTrades } from "./__mocks__/active-trades.mock";

let container: Container;

describe("CsgoempireTradeHttpAdapter", () => {
    beforeEach(() => {
        container = biddingContainer("production");
    });

    it("Should post the coin value to the documented withdraw path of the deposit", async () => {
        const postSpy = jest
            .spyOn(container.get(CSGOEMPIRE_HTTP_CLIENT), "post")
            .mockResolvedValue(createWithdrawalSuccess);

        await container.get(CSGOEMPIRE_TRADE_HTTP).createWithdrawal(createWithdrawalRequest);

        expect(postSpy).toHaveBeenCalledWith(`/trading/deposit/${createWithdrawalRequest.deposit_id}/withdraw`, {
            body: { coin_value: createWithdrawalRequest.coin_value },
        });
    });

    it("Should return the documented response of the withdrawal", async () => {
        jest.spyOn(container.get(CSGOEMPIRE_HTTP_CLIENT), "post").mockResolvedValue(createWithdrawalSuccess);

        const response = await container.get(CSGOEMPIRE_TRADE_HTTP).createWithdrawal(createWithdrawalRequest);

        expect(response).toEqual(createWithdrawalSuccess);
    });

    it("Should get the active trades from the documented path", async () => {
        const getSpy = jest.spyOn(container.get(CSGOEMPIRE_HTTP_CLIENT), "get").mockResolvedValue(activeTrades);

        await container.get(CSGOEMPIRE_TRADE_HTTP).getActiveTrades();

        expect(getSpy).toHaveBeenCalledWith("/trading/user/trades");
    });
});
