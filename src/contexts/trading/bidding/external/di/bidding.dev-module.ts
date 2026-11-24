import { ContainerModule } from "inversify";
import { EVENT_LISTENER, LOGGER } from "@/packages/external/di/packages.identifiers";
import { SOCKET_METADATA } from "@/contexts/trading/shared/external/di/trading-shared.identifiers";
import type { GetSocketMetadataIO } from "@/contexts/trading/shared/infrastructure/csgoempire/http/socket-metadata.http";
import type { Logger } from "@/packages/application/logger";
import type { AuctionGateway } from "../../application/place-bid/auction.gateway";
import type { WithdrawalGateway } from "../../application/withdraw-item/withdrawal.gateway";
import type { CsgoempireAuctionHttp } from "../../infrastructure/http/csgoempire/csgoempire-auction.http";
import type { CsgoempireTradeHttp } from "../../infrastructure/http/csgoempire/csgoempire-trade.http";
import { AuctionGatewayCsgoempireAdapter } from "../../infrastructure/gateways/auction.gateway.csgoempire-adapter";
import { AuctionGatewayDryRunAdapter } from "../../infrastructure/gateways/auction.gateway.dry-run-adapter";
import { WithdrawalGatewayCsgAdapter } from "../../infrastructure/gateways/withdrawal.gateway.csg-adapter";
import { WithdrawalGatewayDryRunAdapter } from "../../infrastructure/gateways/withdrawal.gateway.dry-run-adapter";
import {
    AUCTION_GATEWAY,
    CSGOEMPIRE_AUCTION_HTTP,
    CSGOEMPIRE_TRADE_HTTP,
    ON_APPROVED_IN_AUCTION,
    ON_APPROVED_OFF_AUCTION,
    ON_OUTBID,
    WITHDRAWAL_GATEWAY,
} from "./bidding.identifiers";

const CORE_EVENT_LISTENERS = [ON_APPROVED_IN_AUCTION, ON_OUTBID, ON_APPROVED_OFF_AUCTION];

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
            bind(WITHDRAWAL_GATEWAY)
                .toResolvedValue(BiddingDevModule.createDryRunWithdrawal, [CSGOEMPIRE_TRADE_HTTP, LOGGER])
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

    private static createDryRunWithdrawal(http: CsgoempireTradeHttp, logger: Logger): WithdrawalGateway {
        return new WithdrawalGatewayDryRunAdapter(new WithdrawalGatewayCsgAdapter(http), logger);
    }
}
