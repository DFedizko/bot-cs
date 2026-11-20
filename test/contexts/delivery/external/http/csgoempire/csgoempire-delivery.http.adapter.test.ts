import type { Container } from "inversify";
import { CSGOEMPIRE_HTTP_CLIENT } from "@/contexts/trading/shared/external/di/trading-shared.identifiers";
import { CSGOEMPIRE_DELIVERY_HTTP } from "@/contexts/delivery/external/di/delivery.identifiers";
import { TRADE_ID } from "@/contexts/delivery/domain/__builders__/delivery.builder";
import { deliveryContainer } from "../../di/__builders__/delivery-container.builder";
import { disputeTradeSuccess, markAsReceivedSuccess, sentWithdrawal } from "./__mocks__/trade.mock";

let container: Container;

describe("CsgoempireDeliveryHttpAdapter", () => {
    beforeEach(() => {
        container = deliveryContainer("production");
    });

    it("Should post mark as received to the documented path", async () => {
        const postSpy = jest
            .spyOn(container.get(CSGOEMPIRE_HTTP_CLIENT), "post")
            .mockResolvedValue(markAsReceivedSuccess);

        await container.get(CSGOEMPIRE_DELIVERY_HTTP).markAsReceived({ tradeoffer_id: TRADE_ID });

        expect(postSpy).toHaveBeenCalledWith(`/trading/deposit/${TRADE_ID}/received`);
    });

    it("Should post the dispute to the documented path", async () => {
        const postSpy = jest
            .spyOn(container.get(CSGOEMPIRE_HTTP_CLIENT), "post")
            .mockResolvedValue(disputeTradeSuccess);

        await container.get(CSGOEMPIRE_DELIVERY_HTTP).disputeTrade({ tradeoffer_id: TRADE_ID });

        expect(postSpy).toHaveBeenCalledWith(`/trading/deposit/${TRADE_ID}/dispute`);
    });

    it("Should get the withdrawal from the documented path", async () => {
        const getSpy = jest
            .spyOn(container.get(CSGOEMPIRE_HTTP_CLIENT), "get")
            .mockResolvedValue({ success: true, data: sentWithdrawal() });

        await container.get(CSGOEMPIRE_DELIVERY_HTTP).getTrade({ depositId: TRADE_ID, type: "withdrawal" });

        expect(getSpy).toHaveBeenCalledWith(`/trading/user/trade/${TRADE_ID}/withdrawal`);
    });
});
