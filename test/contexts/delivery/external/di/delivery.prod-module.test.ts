import type { Container } from "inversify";
import { fakeExternals } from "@/__builders__/externals.builder";
import { CSG_TRADES, STEAM_TRADE_OFFERS } from "@/contexts/delivery/external/di/delivery.identifiers";
import { SteamTradeOffersGatewayAdapter } from "@/contexts/delivery/infrastructure/gateways/steam-trade-offers.gateway.adapter";
import { CsgTradesGatewayAdapter } from "@/contexts/delivery/infrastructure/gateways/csg-trades.gateway.adapter";
import { deliveryContainer } from "./__builders__/delivery-container.builder";

let container: Container;

describe("DeliveryProdModule", () => {
    beforeEach(() => {
        container = fakeExternals(deliveryContainer("production"));
    });

    it("Should bind the steam gateway that really accepts offers", () => {
        const gateway = container.get(STEAM_TRADE_OFFERS);

        expect(gateway).toBeInstanceOf(SteamTradeOffersGatewayAdapter);
    });

    it("Should bind the csgoempire gateway that really marks trades", () => {
        const gateway = container.get(CSG_TRADES);

        expect(gateway).toBeInstanceOf(CsgTradesGatewayAdapter);
    });
});
