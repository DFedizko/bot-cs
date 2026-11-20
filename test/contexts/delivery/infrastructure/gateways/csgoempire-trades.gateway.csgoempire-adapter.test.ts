import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { CSGOEMPIRE_DELIVERY_HTTP, CSGOEMPIRE_TRADES } from "@/contexts/delivery/external/di/delivery.identifiers";
import { TRADE_ID } from "../../domain/__builders__/delivery.builder";

let container: Container;

describe("CsgoempireTradesGatewayCsgoempireAdapter", () => {
    beforeEach(() => {
        container = testContainer();
    });

    it("Should read the trade status", async () => {
        const status = await container.get(CSGOEMPIRE_TRADES).getTradeStatus(TRADE_ID);

        expect(status).toEqual({ tradeId: TRADE_ID, status: "Sent" });
    });

    it("Should mark the trade as received", async () => {
        const gateway = container.get(CSGOEMPIRE_TRADES);

        await gateway.markAsReceived(TRADE_ID);

        expect(await gateway.getTradeStatus(TRADE_ID)).toEqual({ tradeId: TRADE_ID, status: "Completed" });
    });

    it("Should dispute the trade", async () => {
        const disputeSpy = jest.spyOn(container.get(CSGOEMPIRE_DELIVERY_HTTP), "disputeTrade");

        await container.get(CSGOEMPIRE_TRADES).dispute(TRADE_ID);

        expect(disputeSpy).toHaveBeenCalledWith({ tradeoffer_id: TRADE_ID });
    });
});
