import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { LOGGER } from "@/packages/external/di/packages.identifiers";
import { CSGOEMPIRE_TRADE_HTTP, WITHDRAWAL_GATEWAY } from "@/contexts/trading/bidding/external/di/bidding.identifiers";
import { activeTrades } from "@/contexts/trading/bidding/external/http/csgoempire/__mocks__/active-trades.mock";

const ITEM_ID = 288767047;
const COIN_VALUE = 3656;
const DRY_RUN_ENV = "development";
const [ACTIVE_WITHDRAWAL] = activeTrades.data.withdrawals;

let container: Container;

const silenceLogger = () => jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});

describe("WithdrawalGatewayDryRunAdapter", () => {
    beforeEach(() => {
        container = testContainer(DRY_RUN_ENV);
    });

    it("Should find the withdrawals of the wrapped gateway", async () => {
        const expected = await testContainer().get(WITHDRAWAL_GATEWAY).findWithdrawal(ACTIVE_WITHDRAWAL!.item_id);

        const withdrawal = await container.get(WITHDRAWAL_GATEWAY).findWithdrawal(ACTIVE_WITHDRAWAL!.item_id);

        expect(withdrawal).toEqual(expected);
    });

    describe("withdraw", () => {
        it("Should never withdraw the item on the marketplace", async () => {
            silenceLogger();
            const withdrawSpy = jest.spyOn(container.get(CSGOEMPIRE_TRADE_HTTP), "createWithdrawal");

            await container.get(WITHDRAWAL_GATEWAY).withdraw(ITEM_ID, COIN_VALUE);

            expect(withdrawSpy).not.toHaveBeenCalled();
        });

        it("Should return the withdrawal of the item at its value", async () => {
            silenceLogger();

            const withdrawal = await container.get(WITHDRAWAL_GATEWAY).withdraw(ITEM_ID, COIN_VALUE);

            expect(withdrawal).toMatchObject({ itemId: ITEM_ID, value: COIN_VALUE });
        });

        it("Should log the skipped withdrawal", async () => {
            const loggerSpy = silenceLogger();

            await container.get(WITHDRAWAL_GATEWAY).withdraw(ITEM_ID, COIN_VALUE);

            expect(loggerSpy).toHaveBeenCalledWith(
                `Dry run: skipped a withdrawal of item "${ITEM_ID}" for ${COIN_VALUE}`,
            );
        });
    });
});
