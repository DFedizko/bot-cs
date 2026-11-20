import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { STEAM_SESSIONS, STEAM_TRADE_OFFERS } from "@/contexts/delivery/external/di/delivery.identifiers";
import { SteamTradeError } from "@/contexts/delivery/infrastructure/steam/steam-trade.error";
import { SteamCredentialsNotFoundError } from "@/contexts/delivery/application/steam-credentials-not-found.error";
import { SteamSessionsFakeAdapter } from "../../external/steam/steam-sessions.fake-adapter";
import { scamOfferAskingOurItems, steamTradeOffer } from "../../external/steam/__mocks__/steam-trade-offer.mock";
import { ACCOUNT_ID, ASSET_ID, SELLER_STEAM_ID } from "../../domain/__builders__/delivery.builder";
import { OFFER_ID } from "../../domain/__builders__/received-offer.builder";

const UNKNOWN_ACCOUNT_ID = 1;
const HOLD_DAYS = 7;
const TIMED_OUT = "ETIMEDOUT";

let container: Container;

describe("SteamTradeOffersGatewaySteamAdapter", () => {
    beforeEach(() => {
        container = testContainer();
    });

    it("Should list the account's received offers as DTOs", async () => {
        const offers = await container.get(STEAM_TRADE_OFFERS).listReceivedActive(ACCOUNT_ID);

        expect(offers).toEqual([
            {
                id: OFFER_ID,
                partnerSteamId: SELLER_STEAM_ID,
                isActive: true,
                isGlitched: false,
                escrowDays: 0,
                itemsToGive: [],
                itemsToReceive: [{ assetId: ASSET_ID, appId: 730 }],
            },
        ]);
    });

    it("Should log in with the credentials of the account", async () => {
        const sessionSpy = jest.spyOn(container.get(STEAM_SESSIONS), "sessionFor");

        await container.get(STEAM_TRADE_OFFERS).listReceivedActive(ACCOUNT_ID);

        expect(sessionSpy).toHaveBeenCalledWith(expect.objectContaining({ accountName: "buyer" }));
    });

    it("Should refuse an account without steam credentials", async () => {
        const offers = container.get(STEAM_TRADE_OFFERS).listReceivedActive(UNKNOWN_ACCOUNT_ID);

        await expect(offers).rejects.toThrow(SteamCredentialsNotFoundError);
    });

    it("Should accept an offer", async () => {
        const outcome = await container.get(STEAM_TRADE_OFFERS).accept(ACCOUNT_ID, OFFER_ID);

        expect(outcome).toBe("accepted");
    });

    it("Should say when the accepted offer needs a mobile confirmation", async () => {
        container
            .rebind(STEAM_SESSIONS)
            .toConstantValue(new SteamSessionsFakeAdapter(undefined, { confirmationRequired: true }));

        const outcome = await container.get(STEAM_TRADE_OFFERS).accept(ACCOUNT_ID, OFFER_ID);

        expect(outcome).toBe("needs_confirmation");
    });

    it("Should say when the accepted offer went on hold", async () => {
        container
            .rebind(STEAM_SESSIONS)
            .toConstantValue(new SteamSessionsFakeAdapter([steamTradeOffer({ escrowDays: HOLD_DAYS })]));

        const outcome = await container.get(STEAM_TRADE_OFFERS).accept(ACCOUNT_ID, OFFER_ID);

        expect(outcome).toBe("on_hold");
    });

    it("Should report an accept that timed out after steam accepted it", async () => {
        container
            .rebind(STEAM_SESSIONS)
            .toConstantValue(new SteamSessionsFakeAdapter(undefined, { acceptTimesOut: true }));

        const outcome = await container.get(STEAM_TRADE_OFFERS).accept(ACCOUNT_ID, OFFER_ID);

        expect(outcome).toBe("accepted");
    });

    it("Should fail an accept that steam did not carry out", async () => {
        const session = container
            .get(STEAM_SESSIONS)
            .sessionFor({ accountName: "buyer", password: "", sharedSecret: "", identitySecret: "" });
        jest.spyOn(session, "acceptOffer").mockRejectedValue(new SteamTradeError(TIMED_OUT));

        const outcome = container.get(STEAM_TRADE_OFFERS).accept(ACCOUNT_ID, OFFER_ID);

        await expect(outcome).rejects.toThrow(TIMED_OUT);
    });

    it("Should confirm a pending offer", async () => {
        container
            .rebind(STEAM_SESSIONS)
            .toConstantValue(new SteamSessionsFakeAdapter(undefined, { confirmationRequired: true }));
        const gateway = container.get(STEAM_TRADE_OFFERS);
        await gateway.accept(ACCOUNT_ID, OFFER_ID);

        await gateway.confirm(ACCOUNT_ID, OFFER_ID);

        expect(await gateway.listReceivedActive(ACCOUNT_ID)).toEqual([]);
    });

    it("Should cancel an offer", async () => {
        const scam = scamOfferAskingOurItems();
        container.rebind(STEAM_SESSIONS).toConstantValue(new SteamSessionsFakeAdapter([scam]));
        const gateway = container.get(STEAM_TRADE_OFFERS);

        await gateway.cancel(ACCOUNT_ID, scam.id);

        expect(await gateway.listReceivedActive(ACCOUNT_ID)).toEqual([]);
    });
});
