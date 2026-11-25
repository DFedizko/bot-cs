import { ContainerModule } from "inversify";
import type { CsgoempireAuctionHttp } from "../../infrastructure/http/csgoempire/csgoempire-auction.http";
import type { CsgoempireTradeHttp } from "../../infrastructure/http/csgoempire/csgoempire-trade.http";
import { AuctionGatewayCsgoempireAdapter } from "../../infrastructure/gateways/auction.gateway.csgoempire-adapter";
import { WithdrawalGatewayCsgAdapter } from "../../infrastructure/gateways/withdrawal.gateway.csg-adapter";
import {
    AUCTION_GATEWAY,
    CSGOEMPIRE_AUCTION_HTTP,
    CSGOEMPIRE_TRADE_HTTP,
    WITHDRAWAL_GATEWAY,
} from "./bidding.identifiers";

export class BiddingProdModule extends ContainerModule {
    constructor() {
        super(({ bind }) => {
            bind(AUCTION_GATEWAY)
                .toResolvedValue(
                    (http: CsgoempireAuctionHttp) => new AuctionGatewayCsgoempireAdapter(http),
                    [CSGOEMPIRE_AUCTION_HTTP],
                )
                .inSingletonScope();
            bind(WITHDRAWAL_GATEWAY)
                .toResolvedValue(
                    (http: CsgoempireTradeHttp) => new WithdrawalGatewayCsgAdapter(http),
                    [CSGOEMPIRE_TRADE_HTTP],
                )
                .inSingletonScope();
        });
    }
}
