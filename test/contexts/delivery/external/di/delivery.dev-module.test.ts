import type { Container } from "inversify";
import { fakeExternals } from "@/__builders__/externals.builder";
import { CSG_TRADES, STEAM_TRADE_OFFERS } from "@/contexts/delivery/external/di/delivery.identifiers";
import { SteamTradeOffersGatewayDryRunAdapter } from "@/contexts/delivery/infrastructure/gateways/steam-trade-offers.gateway.dry-run-adapter";
import { CsgTradesGatewayDryRunAdapter } from "@/contexts/delivery/infrastructure/gateways/csg-trades.gateway.dry-run-adapter";
import { deliveryContainer } from "./__builders__/delivery-container.builder";

let container: Container;

describe("DeliveryDevModule", () => {
    beforeEach(() => {
        container = fakeExternals(deliveryContainer("development"));
    });

    it("Should bind the dry-run steam gateway", () => {
        const gateway = container.get(STEAM_TRADE_OFFERS);

        expect(gateway).toBeInstanceOf(SteamTradeOffersGatewayDryRunAdapter);
    });

    it("Should bind the dry-run csgoempire gateway", () => {
        const gateway = container.get(CSG_TRADES);

        expect(gateway).toBeInstanceOf(CsgTradesGatewayDryRunAdapter);
    });
});
