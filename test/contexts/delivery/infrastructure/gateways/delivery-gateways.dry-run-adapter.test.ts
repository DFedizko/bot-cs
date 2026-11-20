import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { LOGGER } from "@/packages/external/di/packages.identifiers";
import {
    CSGOEMPIRE_DELIVERY_HTTP,
    CSGOEMPIRE_TRADES,
    STEAM_SESSIONS,
    STEAM_TRADE_OFFERS,
} from "@/contexts/delivery/external/di/delivery.identifiers";
import { ACCOUNT_ID, TRADE_ID, TRADE_OFFER_ID } from "../../domain/__builders__/delivery.builder";
import { OFFER_ID } from "../../domain/__builders__/received-offer.builder";

const DRY_RUN_ENV = "development";

let container: Container;

describe("Delivery dry-run gateways", () => {
    beforeEach(() => {
        container = testContainer(DRY_RUN_ENV);
        jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});
    });

    it("Should still list the real received offers", async () => {
        const offers = await container.get(STEAM_TRADE_OFFERS).listReceivedActive(ACCOUNT_ID);

        expect(offers).toHaveLength(1);
    });

    it.each(["accept", "cancel", "confirm"] as const)("Should never %s an offer on steam", async (action) => {
        const session = container.get(STEAM_SESSIONS).sessionFor({
            accountName: "buyer",
            password: "",
            sharedSecret: "",
            identitySecret: "",
        });
        const spies = [
            jest.spyOn(session, "acceptOffer"),
            jest.spyOn(session, "cancelOffer"),
            jest.spyOn(session, "confirmOffer"),
        ];

        await container.get(STEAM_TRADE_OFFERS)[action](ACCOUNT_ID, OFFER_ID);

        spies.forEach((spy) => expect(spy).not.toHaveBeenCalled());
    });

    it("Should log the offer it would accept", async () => {
        const loggerSpy = jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});

        await container.get(STEAM_TRADE_OFFERS).accept(ACCOUNT_ID, OFFER_ID);

        expect(loggerSpy).toHaveBeenCalledWith(
            `[dry-run] Would accept offer "${OFFER_ID}" for account "${ACCOUNT_ID}"`,
        );
    });

    it.each(["markAsReceived", "dispute"] as const)("Should never %s on csgoempire", async (action) => {
        const http = container.get(CSGOEMPIRE_DELIVERY_HTTP);
        const spies = [jest.spyOn(http, "markAsReceived"), jest.spyOn(http, "disputeTrade")];

        await container.get(CSGOEMPIRE_TRADES)[action](TRADE_OFFER_ID);

        spies.forEach((spy) => expect(spy).not.toHaveBeenCalled());
    });

    it("Should still read the real trade status", async () => {
        const status = await container.get(CSGOEMPIRE_TRADES).getTradeStatus(TRADE_ID);

        expect(status.status).toBe("Sent");
    });
});
