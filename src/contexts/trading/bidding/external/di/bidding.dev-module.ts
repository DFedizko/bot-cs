import { ContainerModule } from "inversify";
import { EVENT_LISTENER, LOGGER } from "@/packages/external/di/packages.identifiers";
import { SOCKET_METADATA } from "@/contexts/trading/shared/external/di/trading-shared.identifiers";
import type { GetSocketMetadataIO } from "@/contexts/trading/shared/infrastructure/csgoempire/http/socket-metadata.http";
import type { Logger } from "@/packages/application/logger";
import type { AuctionGateway } from "../../application/place-bid/auction.gateway";
import type { CsgoempireAuctionHttp } from "../../infrastructure/http/csgoempire/csgoempire-auction.http";
import { AuctionGatewayCsgoempireAdapter } from "../../infrastructure/gateways/auction.gateway.csgoempire-adapter";
import { AuctionGatewayDryRunAdapter } from "../../infrastructure/gateways/auction.gateway.dry-run-adapter";
import { AUCTION_GATEWAY, CSGOEMPIRE_AUCTION_HTTP, ON_APPROVED_IN_AUCTION, ON_OUTBID } from "./bidding.identifiers";

const CORE_EVENT_LISTENERS = [ON_APPROVED_IN_AUCTION, ON_OUTBID];

export class BiddingDevModule extends ContainerModule {
    constructor() {
        super(({ bind }) => {
            bind(AUCTION_GATEWAY)
                .toResolvedValue(BiddingDevModule.createDryRunGateway, [
                    CSGOEMPIRE_AUCTION_HTTP,
                    LOGGER,
                    SOCKET_METADATA,
                ])
                .inSingletonScope();
            CORE_EVENT_LISTENERS.forEach((listener) => bind(EVENT_LISTENER).toService(listener));
        });
    }

    private static createDryRunGateway(
        http: CsgoempireAuctionHttp,
        logger: Logger,
        metadata: GetSocketMetadataIO.Response,
    ): AuctionGateway {
        return new AuctionGatewayDryRunAdapter(new AuctionGatewayCsgoempireAdapter(http), logger, metadata.user.id);
    }
}
