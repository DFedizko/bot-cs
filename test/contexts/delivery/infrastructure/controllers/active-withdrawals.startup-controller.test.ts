import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { LOGGER } from "@/packages/external/di/packages.identifiers";
import {
    ACTIVE_WITHDRAWALS_CONTROLLER,
    CSG_DELIVERY_HTTP,
    DELIVERY_REPOSITORY,
} from "@/contexts/delivery/external/di/delivery.identifiers";
import { DeliveryStatus } from "@/contexts/delivery/domain/delivery/delivery-status";
import { TradeId } from "@/contexts/delivery/domain/delivery/trade-id";
import { ACCOUNT_ID, TRADE_ID } from "@/contexts/delivery/domain/__builders__/delivery.builder";
import { CsgDeliveryHttpFakeAdapter } from "../../external/http/csgoempire/csg-delivery.http.fake-adapter";
import { tradeWithdrawal } from "../../external/http/csgoempire/__mocks__/trade-withdrawal.mock";
import { fakeScheduler } from "../../__builders__/tracking.builder";
import { SENDING } from "./__mocks__/trade-status.mock";

const UNAVAILABLE = "HTTP error 503";

const givenActiveWithdrawals = (container: Container, withdrawals = [tradeWithdrawal()]): void => {
    container.rebind(CSG_DELIVERY_HTTP).toConstantValue(new CsgDeliveryHttpFakeAdapter([], withdrawals));
};

let container: Container;

describe("ActiveWithdrawalsStartupController", () => {
    beforeEach(() => {
        container = testContainer();
        jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});
    });

    it("Should resume the delivery of a withdrawal csgoempire already sent", async () => {
        givenActiveWithdrawals(container);

        await container.get(ACTIVE_WITHDRAWALS_CONTROLLER).resume(ACCOUNT_ID);

        const delivery = await container.get(DELIVERY_REPOSITORY).findByTradeId(new TradeId(TRADE_ID));
        expect(delivery?.getStatus()).toBe(DeliveryStatus.AWAITING_OFFER);
    });

    it("Should resume tracking its offer", async () => {
        givenActiveWithdrawals(container);

        await container.get(ACTIVE_WITHDRAWALS_CONTROLLER).resume(ACCOUNT_ID);

        expect(fakeScheduler(container).activeIntervals()).toHaveLength(1);
    });

    it("Should leave withdrawals that were not sent yet", async () => {
        givenActiveWithdrawals(container, [tradeWithdrawal(SENDING)]);

        await container.get(ACTIVE_WITHDRAWALS_CONTROLLER).resume(ACCOUNT_ID);

        expect(fakeScheduler(container).activeIntervals()).toEqual([]);
    });

    it("Should log a failed listing instead of stopping the startup", async () => {
        givenActiveWithdrawals(container);
        jest.spyOn(container.get(CSG_DELIVERY_HTTP), "getActiveTrades").mockRejectedValue(new Error(UNAVAILABLE));
        const loggerSpy = jest.spyOn(container.get(LOGGER), "log");

        await container.get(ACTIVE_WITHDRAWALS_CONTROLLER).resume(ACCOUNT_ID);

        expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining(UNAVAILABLE));
    });
});
