import type { SteamTradeOffer } from "@/contexts/delivery/infrastructure/steam/steam-trade-offer";
import { STEAM_OFFER_STATE } from "@/contexts/delivery/infrastructure/steam/steam-trade-offer";
import { SteamTradeError } from "@/contexts/delivery/infrastructure/steam/errors/steam-trade.error";
import type { SteamLogin } from "@/contexts/delivery/infrastructure/steam/steam-login";
import { SteamSessionsFakeAdapter } from "./steam-sessions.fake-adapter";
import { scamOfferAskingOurItems, steamTradeOffer } from "./__mocks__/steam-trade-offer.mock";
import { OFFER_ID } from "@/contexts/delivery/domain/__builders__/received-offer.builder";

const HOLD_DAYS = 7;
const UNKNOWN_OFFER_ID = "1";
const login = (accountName = "buyer"): SteamLogin => ({
    accountName,
    password: "password",
    sharedSecret: "c2hhcmVk",
    identitySecret: "aWRlbnRpdHk=",
});

describe("SteamSessions", () => {
    it("Should list the received active offers as documented", async () => {
        const offers = await new SteamSessionsFakeAdapter().sessionFor(login()).getReceivedActiveOffers();

        expectTypeOf(offers).toEqualTypeOf<SteamTradeOffer[]>();
        expect(offers).toEqual([steamTradeOffer()]);
    });

    it("Should leave out the offers we sent", async () => {
        const sessions = new SteamSessionsFakeAdapter([steamTradeOffer({ isOurOffer: true })]);

        const offers = await sessions.sessionFor(login()).getReceivedActiveOffers();

        expect(offers).toEqual([]);
    });

    it("Should keep one session per account", () => {
        const sessions = new SteamSessionsFakeAdapter();

        const session = sessions.sessionFor(login());

        expect(sessions.sessionFor(login("other"))).not.toBe(session);
    });

    it("Should accept an offer that needs no confirmation", async () => {
        const session = new SteamSessionsFakeAdapter().sessionFor(login());

        const status = await session.acceptOffer(OFFER_ID);

        expect(status).toBe("accepted");
        expect(await session.getReceivedActiveOffers()).toEqual([]);
    });

    it("Should leave an accepted offer pending until it is confirmed", async () => {
        const session = new SteamSessionsFakeAdapter(undefined, { confirmationRequired: true }).sessionFor(login());

        const status = await session.acceptOffer(OFFER_ID);

        expect(status).toBe("pending");
    });

    it("Should complete a pending offer once confirmed", async () => {
        const session = new SteamSessionsFakeAdapter(undefined, { confirmationRequired: true }).sessionFor(login());
        await session.acceptOffer(OFFER_ID);

        await session.confirmOffer(OFFER_ID);

        expect(await session.getReceivedActiveOffers()).toEqual([]);
    });

    it("Should refuse to confirm an offer with nothing to confirm", async () => {
        const session = new SteamSessionsFakeAdapter().sessionFor(login());

        await expect(session.confirmOffer(OFFER_ID)).rejects.toThrow(SteamTradeError);
    });

    it("Should put an offer with a trade hold into escrow", async () => {
        const session = new SteamSessionsFakeAdapter([steamTradeOffer({ escrowDays: HOLD_DAYS })]).sessionFor(login());

        const status = await session.acceptOffer(OFFER_ID);

        expect(status).toBe("escrow");
    });

    it("Should decline a cancelled received offer", async () => {
        const scam = scamOfferAskingOurItems();
        const session = new SteamSessionsFakeAdapter([scam]).sessionFor(login());

        await session.cancelOffer(scam.id);

        expect(await session.getReceivedActiveOffers()).toEqual([]);
    });

    it.each([
        { scenario: "unknown", offers: [], offerId: UNKNOWN_OFFER_ID },
        {
            scenario: "no longer active",
            offers: [steamTradeOffer({ state: STEAM_OFFER_STATE.CANCELED })],
            offerId: OFFER_ID,
        },
    ])("Should fail to accept an offer that is $scenario", async ({ offers, offerId }) => {
        const session = new SteamSessionsFakeAdapter(offers).sessionFor(login());

        await expect(session.acceptOffer(offerId)).rejects.toThrow(SteamTradeError);
    });

    it("Should read the state of an offer", async () => {
        const session = new SteamSessionsFakeAdapter().sessionFor(login());
        await session.acceptOffer(OFFER_ID);

        const state = await session.getOfferState(OFFER_ID);

        expect(state).toBe(STEAM_OFFER_STATE.ACCEPTED);
    });

    it("Should fail to read the state of an unknown offer", async () => {
        const session = new SteamSessionsFakeAdapter([]).sessionFor(login());

        await expect(session.getOfferState(UNKNOWN_OFFER_ID)).rejects.toThrow(SteamTradeError);
    });

    it("Should time out an accept that steam still carried out", async () => {
        const session = new SteamSessionsFakeAdapter(undefined, { acceptTimesOut: true }).sessionFor(login());

        await expect(session.acceptOffer(OFFER_ID)).rejects.toThrow(SteamTradeError);
        expect(await session.getOfferState(OFFER_ID)).toBe(STEAM_OFFER_STATE.ACCEPTED);
    });

    it("Should hand out copies that tests can't mutate", async () => {
        const session = new SteamSessionsFakeAdapter().sessionFor(login());
        const [offer] = await session.getReceivedActiveOffers();
        offer.itemsToGive.push(offer.itemsToReceive[0]);

        const [again] = await session.getReceivedActiveOffers();

        expect(again.itemsToGive).toEqual([]);
    });
});
