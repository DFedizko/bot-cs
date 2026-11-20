import type { DisputeTrade } from "@/contexts/delivery/infrastructure/http/csgoempire/dispute-trade";
import type { GetTrade } from "@/contexts/delivery/infrastructure/http/csgoempire/get-trade";
import type { MarkAsReceived } from "@/contexts/delivery/infrastructure/http/csgoempire/mark-as-received";
import { NotFoundError } from "@/packages/infrastructure/http/errors/not-found.error";
import { TRADE_ID } from "@/contexts/delivery/domain/__builders__/delivery.builder";
import { CsgoempireDeliveryHttpFakeAdapter } from "./csgoempire-delivery.http.fake-adapter";
import { sentWithdrawal } from "./__mocks__/trade.mock";

const UNKNOWN_TRADE_ID = 1;
const WITHDRAWAL = "withdrawal";

describe("CsgoempireDeliveryHttp", () => {
    it("Should get a sent withdrawal", async () => {
        const response = await new CsgoempireDeliveryHttpFakeAdapter().getTrade({
            depositId: TRADE_ID,
            type: WITHDRAWAL,
        });

        expectTypeOf(response).toEqualTypeOf<GetTrade.Response>();
        expect(response.data).toEqual(sentWithdrawal());
    });

    it("Should mark a trade as received", async () => {
        const http = new CsgoempireDeliveryHttpFakeAdapter();

        const response = await http.markAsReceived({ tradeoffer_id: TRADE_ID });

        expectTypeOf(response).toEqualTypeOf<MarkAsReceived.Response>();
        expect((await http.getTrade({ depositId: TRADE_ID, type: WITHDRAWAL })).data.status_message).toBe("Completed");
    });

    it("Should dispute a trade", async () => {
        const http = new CsgoempireDeliveryHttpFakeAdapter();

        const response = await http.disputeTrade({ tradeoffer_id: TRADE_ID });

        expectTypeOf(response).toEqualTypeOf<DisputeTrade.Response>();
        expect((await http.getTrade({ depositId: TRADE_ID, type: WITHDRAWAL })).data.status_message).toBe("Disputed");
    });

    it.each([
        {
            endpoint: "markAsReceived",
            call: (http: CsgoempireDeliveryHttpFakeAdapter) => http.markAsReceived({ tradeoffer_id: UNKNOWN_TRADE_ID }),
        },
        {
            endpoint: "disputeTrade",
            call: (http: CsgoempireDeliveryHttpFakeAdapter) => http.disputeTrade({ tradeoffer_id: UNKNOWN_TRADE_ID }),
        },
        {
            endpoint: "getTrade",
            call: (http: CsgoempireDeliveryHttpFakeAdapter) =>
                http.getTrade({ depositId: UNKNOWN_TRADE_ID, type: WITHDRAWAL }),
        },
    ])("Should fail $endpoint for an unknown trade", async ({ call }) => {
        await expect(call(new CsgoempireDeliveryHttpFakeAdapter())).rejects.toThrow(NotFoundError);
    });
});
