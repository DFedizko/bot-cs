import type { Container } from "inversify";
import { fakeExternals } from "@/__builders__/externals.builder";
import { CSGOEMPIRE_TRADES, STEAM_TRADE_OFFERS } from "@/contexts/delivery/external/di/delivery.identifiers";
import { SteamTradeOffersGatewaySteamAdapter } from "@/contexts/delivery/infrastructure/gateways/steam-trade-offers.gateway.steam-adapter";
import { CsgoempireTradesGatewayCsgoempireAdapter } from "@/contexts/delivery/infrastructure/gateways/csgoempire-trades.gateway.csgoempire-adapter";
import { deliveryContainer } from "./__builders__/delivery-container.builder";

let container: Container;

describe("DeliveryProdModule", () => {
    beforeEach(() => {
        container = fakeExternals(deliveryContainer("production"));
    });

    it("Should bind the steam gateway that really accepts offers", () => {
        const gateway = container.get(STEAM_TRADE_OFFERS);

        expect(gateway).toBeInstanceOf(SteamTradeOffersGatewaySteamAdapter);
    });

    it("Should bind the csgoempire gateway that really marks trades", () => {
        const gateway = container.get(CSGOEMPIRE_TRADES);

        expect(gateway).toBeInstanceOf(CsgoempireTradesGatewayCsgoempireAdapter);
    });
});
