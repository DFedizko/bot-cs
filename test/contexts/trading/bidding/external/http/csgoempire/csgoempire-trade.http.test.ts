import { CsgoempireTradeHttpFakeAdapter } from "./csgoempire-trade.http.fake-adapter";
import type { GetActiveTrades } from "@/contexts/trading/bidding/infrastructure/http/csgoempire/get-active-trades";
import type { CreateWithdrawal } from "@/contexts/trading/bidding/infrastructure/http/csgoempire/create-withdrawal";
import { HttpError } from "@/packages/infrastructure/http/errors/http.error";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import { createWithdrawalRequest } from "./__mocks__/create-withdrawal.mock";
import { activeTrades } from "./__mocks__/active-trades.mock";

const [ACTIVE_WITHDRAWAL] = activeTrades.data.withdrawals;
const ALREADY_WITHDRAWN = { ...createWithdrawalRequest, deposit_id: ACTIVE_WITHDRAWAL!.item_id };

const findWithdrawal = async (http: CsgoempireTradeHttpFakeAdapter, itemId: number) => {
    const { data } = await http.getActiveTrades();
    return data.withdrawals.find((withdrawal) => withdrawal.item_id === itemId);
};

describe("CsgoempireTradeHttp", () => {
    it("Should get active trades", async () => {
        const response = await new CsgoempireTradeHttpFakeAdapter().getActiveTrades();

        expectTypeOf(response).toEqualTypeOf<GetActiveTrades.Response>();
    });

    it("Should return new trades a caller can't mutate", async () => {
        const http = new CsgoempireTradeHttpFakeAdapter();
        (await http.getActiveTrades()).data.withdrawals.pop();

        const { data } = await http.getActiveTrades();

        expect(data.withdrawals).toHaveLength(activeTrades.data.withdrawals.length);
    });

    describe("createWithdrawal", () => {
        it("Should return the documented response", async () => {
            const response = await new CsgoempireTradeHttpFakeAdapter().createWithdrawal(createWithdrawalRequest);

            expectTypeOf(response).toEqualTypeOf<CreateWithdrawal.Response>();
        });

        it("Should add the withdrawal to the active trades with its trade ids", async () => {
            const http = new CsgoempireTradeHttpFakeAdapter();

            const { data } = await http.createWithdrawal(createWithdrawalRequest);

            expect(await findWithdrawal(http, createWithdrawalRequest.deposit_id)).toMatchObject({
                id: data.id,
                tradeoffer_id: data.tradeoffer_id,
                total_value: createWithdrawalRequest.coin_value,
            });
        });

        it("Should give each withdrawal its own trade id", async () => {
            const http = new CsgoempireTradeHttpFakeAdapter();
            const first = await http.createWithdrawal(createWithdrawalRequest);

            const second = await http.createWithdrawal({ ...createWithdrawalRequest, deposit_id: 1 });

            expect(second.data.id).not.toBe(first.data.id);
        });

        it("Should reject an item already withdrawn with the documented bad request", async () => {
            const withdrawing = new CsgoempireTradeHttpFakeAdapter().createWithdrawal(ALREADY_WITHDRAWN);

            await expect(withdrawing).rejects.toMatchObject({ httpStatus: HttpStatus.BAD_REQUEST, message: "{}" });
        });

        it("Should refuse the withdrawal with too many requests when rate limited", async () => {
            const http = new CsgoempireTradeHttpFakeAdapter({ withdrawFailure: "rate-limited" });

            const withdrawing = http.createWithdrawal(createWithdrawalRequest);

            await expect(withdrawing).rejects.toMatchObject({ httpStatus: HttpStatus.TOO_MANY_REQUESTS });
        });

        it("Should fail with a server error without withdrawing the item", async () => {
            const http = new CsgoempireTradeHttpFakeAdapter({ withdrawFailure: "server-error" });

            await expect(http.createWithdrawal(createWithdrawalRequest)).rejects.toBeInstanceOf(HttpError);

            expect(await findWithdrawal(http, createWithdrawalRequest.deposit_id)).toBeUndefined();
        });

        it("Should withdraw the item but lose the response", async () => {
            const http = new CsgoempireTradeHttpFakeAdapter({ withdrawFailure: "lost-response" });

            await expect(http.createWithdrawal(createWithdrawalRequest)).rejects.toBeInstanceOf(HttpError);

            expect(await findWithdrawal(http, createWithdrawalRequest.deposit_id)).toBeDefined();
        });
    });
});
