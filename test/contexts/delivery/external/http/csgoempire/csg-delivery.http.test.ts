import type { DisputeTrade } from "@/contexts/delivery/infrastructure/http/csgoempire/dispute-trade";
import type { GetTrade } from "@/contexts/delivery/infrastructure/http/csgoempire/get-trade";
import type { GetActiveTrades } from "@/contexts/delivery/infrastructure/http/csgoempire/get-active-trades";
import type { MarkAsReceived } from "@/contexts/delivery/infrastructure/http/csgoempire/mark-as-received";
import { NotFoundError } from "@/packages/infrastructure/http/errors/not-found.error";
import { TRADE_ID, TRADE_OFFER_ID } from "@/contexts/delivery/domain/__builders__/delivery.builder";
import { CsgDeliveryHttpFakeAdapter } from "./csg-delivery.http.fake-adapter";
import { sentWithdrawal, tradeNotFound } from "./__mocks__/trade.mock";
import { activeTrades, tradeWithdrawal } from "./__mocks__/trade-withdrawal.mock";

const UNKNOWN_ID = 1;
const WITHDRAWAL = "withdrawal";

const statusOf = async (http: CsgDeliveryHttpFakeAdapter) => {
    const response = await http.getTrade({ depositId: TRADE_ID, type: WITHDRAWAL });
    return "status_message" in response.data ? response.data.status_message : undefined;
};

describe("CsgDeliveryHttp", () => {
    it("Should list the active withdrawals of the account", async () => {
        const response = await new CsgDeliveryHttpFakeAdapter([], [tradeWithdrawal()]).getActiveTrades();

        expectTypeOf(response).toEqualTypeOf<GetActiveTrades.Response>();
        expect(response).toEqual(activeTrades([tradeWithdrawal()]));
    });

    it("Should list no active trades by default", async () => {
        const response = await new CsgDeliveryHttpFakeAdapter().getActiveTrades();

        expect(response).toEqual(activeTrades());
    });

    it("Should get a sent withdrawal by its trade id", async () => {
        const response = await new CsgDeliveryHttpFakeAdapter().getTrade({
            depositId: TRADE_ID,
            type: WITHDRAWAL,
        });

        expectTypeOf(response).toEqualTypeOf<GetTrade.Response | GetTrade.NotFoundResponse>();
        expect(response).toEqual({ success: true, data: sentWithdrawal() });
    });

    it("Should answer the documented empty trade for an unknown trade id", async () => {
        const response = await new CsgDeliveryHttpFakeAdapter().getTrade({
            depositId: UNKNOWN_ID,
            type: WITHDRAWAL,
        });

        expect(response).toEqual(tradeNotFound);
    });

    it("Should mark a trade as received by its trade offer id", async () => {
        const http = new CsgDeliveryHttpFakeAdapter();

        const response = await http.markAsReceived({ tradeoffer_id: TRADE_OFFER_ID });

        expectTypeOf(response).toEqualTypeOf<MarkAsReceived.Response>();
        expect(await statusOf(http)).toBe("Completed");
    });

    it("Should dispute a trade by its trade offer id", async () => {
        const http = new CsgDeliveryHttpFakeAdapter();

        const response = await http.disputeTrade({ tradeoffer_id: TRADE_OFFER_ID });

        expectTypeOf(response).toEqualTypeOf<DisputeTrade.Response>();
        expect(await statusOf(http)).toBe("Disputed");
    });

    it.each([
        {
            endpoint: "markAsReceived",
            call: (http: CsgDeliveryHttpFakeAdapter) => http.markAsReceived({ tradeoffer_id: TRADE_ID }),
        },
        {
            endpoint: "disputeTrade",
            call: (http: CsgDeliveryHttpFakeAdapter) => http.disputeTrade({ tradeoffer_id: UNKNOWN_ID }),
        },
    ])("Should refuse $endpoint for an id that is not a trade offer id", async ({ call }) => {
        await expect(call(new CsgDeliveryHttpFakeAdapter())).rejects.toThrow(NotFoundError);
    });
});
