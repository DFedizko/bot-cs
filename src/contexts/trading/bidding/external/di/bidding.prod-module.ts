import { ContainerModule } from "inversify";
import type { CsgoempireAuctionHttp } from "../../infrastructure/http/csgoempire/csgoempire-auction.http";
import { AuctionGatewayCsgoempireAdapter } from "../../infrastructure/gateways/auction.gateway.csgoempire-adapter";
import { AUCTION_GATEWAY, CSGOEMPIRE_AUCTION_HTTP } from "./bidding.identifiers";

export class BiddingProdModule extends ContainerModule {
    constructor() {
        super(({ bind }) => {
            bind(AUCTION_GATEWAY)
                .toResolvedValue(
                    (http: CsgoempireAuctionHttp) => new AuctionGatewayCsgoempireAdapter(http),
                    [CSGOEMPIRE_AUCTION_HTTP],
                )
                .inSingletonScope();
        });
    }
}
