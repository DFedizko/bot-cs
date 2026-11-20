import { identifier } from "@/packages/external/di/identifier";
import type { AccountRepository } from "../../application/account.repository";
import type { WantedItemRepository } from "../../application/wanted-item.repository";
import type { AuctionGateway } from "../../application/place-bid/auction.gateway";
import type { ActiveTradesGateway } from "../../application/synchronize-account/active-trades.gateway";
import type { CsgoempireAuctionHttp } from "../../infrastructure/http/csgoempire/csgoempire-auction.http";
import type { CsgoempireTradeHttp } from "../../infrastructure/http/csgoempire/csgoempire-trade.http";
import type { NewItemWsController } from "../../infrastructure/controllers/new-item.ws-controller";

export const CSGOEMPIRE_AUCTION_HTTP = identifier<CsgoempireAuctionHttp>("CsgoempireAuctionHttp");
export const CSGOEMPIRE_TRADE_HTTP = identifier<CsgoempireTradeHttp>("CsgoempireTradeHttp");
export const AUCTION_GATEWAY = identifier<AuctionGateway>("AuctionGateway");
export const ACTIVE_TRADES_GATEWAY = identifier<ActiveTradesGateway>("ActiveTradesGateway");
export const ACCOUNT_REPOSITORY = identifier<AccountRepository>("AccountRepository");
export const WANTED_ITEM_REPOSITORY = identifier<WantedItemRepository>("WantedItemRepository");
export const NEW_ITEM_CONTROLLER = identifier<NewItemWsController>("NewItemWsController");
