import { identifier } from "@/packages/external/di/identifier";
import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import type { QueryHandler } from "@/packages/building-blocks/query-handler";
import type { EventListener } from "@/packages/application/event-listener";
import type { AccountRepository } from "../../application/account.repository";
import type { AuctionParticipationRepository } from "../../application/auction-participation.repository";
import type { WantedItemRepository } from "../../application/wanted-item.repository";
import type { WantedItemStoreInMemory } from "../../infrastructure/stores/wanted-item.store.in-memory";
import type { WantedItemsDao } from "../../application/list-wanted-items/wanted-items.dao";
import type { ListWantedItemsQuery } from "../../application/list-wanted-items/list-wanted-items.query";
import type { ListWantedItemsResponse } from "../../application/list-wanted-items/list-wanted-items.response";
import type { AuctionGateway } from "../../application/place-bid/auction.gateway";
import type { WithdrawalGateway } from "../../application/withdraw-item/withdrawal.gateway";
import type { ActiveTradesGateway } from "../../application/synchronize-account/active-trades.gateway";
import type { AddWantedItemCommand } from "../../application/add-wanted-item/add-wanted-item.command";
import type { EditWantedItemCommand } from "../../application/edit-wanted-item/edit-wanted-item.command";
import type { EvaluateItemCommand } from "../../application/evaluate-item/evaluate-item.command";
import type { ItemApprovedInAuctionEvent } from "../../application/evaluate-item/item-approved-in-auction.event";
import type { ItemApprovedOffAuctionEvent } from "../../application/evaluate-item/item-approved-off-auction.event";
import type { LeaveAuctionCommand } from "../../application/leave-auction/leave-auction.command";
import type { WithdrawItemCommand } from "../../application/withdraw-item/withdraw-item.command";
import type { PlaceBidCommand } from "../../application/place-bid/place-bid.command";
import type { RemoveWantedItemCommand } from "../../application/remove-wanted-item/remove-wanted-item.command";
import type { ToggleWantedItemCommand } from "../../application/toggle-wanted-item/toggle-wanted-item.command";
import type { SynchronizeAccountCommand } from "../../application/synchronize-account/synchronize-account.command";
import type { OutbidEvent } from "../../application/track-auction-update/outbid.event";
import type { TrackAuctionUpdateCommand } from "../../application/track-auction-update/track-auction-update.command";
import type { CsgoempireAuctionHttp } from "../../infrastructure/http/csgoempire/csgoempire-auction.http";
import type { CsgoempireTradeHttp } from "../../infrastructure/http/csgoempire/csgoempire-trade.http";
import type { NewItemWsController } from "../../infrastructure/controllers/new-item.ws-controller";
import type { AddWantedItemHttpController } from "../../infrastructure/controllers/add-wanted-item.http-controller";
import type { EditWantedItemHttpController } from "../../infrastructure/controllers/edit-wanted-item.http-controller";
import type { RemoveWantedItemHttpController } from "../../infrastructure/controllers/remove-wanted-item.http-controller";
import type { ToggleWantedItemHttpController } from "../../infrastructure/controllers/toggle-wanted-item.http-controller";
import type { ToggleWantedItemInput } from "../../infrastructure/controllers/toggle-wanted-item.input";
import type { Validator } from "@/packages/infrastructure/validation/validator";
import type { AddWantedItemInput } from "../../infrastructure/controllers/add-wanted-item.input";
import type { EditWantedItemInput } from "../../infrastructure/controllers/edit-wanted-item.input";
import type { RemoveWantedItemInput } from "../../infrastructure/controllers/remove-wanted-item.input";
import type { AuctionUpdateWsController } from "../../infrastructure/controllers/auction-update.ws-controller";

export const CSGOEMPIRE_AUCTION_HTTP = identifier<CsgoempireAuctionHttp>("CsgoempireAuctionHttp");
export const CSGOEMPIRE_TRADE_HTTP = identifier<CsgoempireTradeHttp>("CsgoempireTradeHttp");
export const AUCTION_GATEWAY = identifier<AuctionGateway>("AuctionGateway");
export const WITHDRAWAL_GATEWAY = identifier<WithdrawalGateway>("WithdrawalGateway");
export const ACTIVE_TRADES_GATEWAY = identifier<ActiveTradesGateway>("ActiveTradesGateway");
export const ACCOUNT_REPOSITORY = identifier<AccountRepository>("AccountRepository");
export const WANTED_ITEM_STORE = identifier<WantedItemStoreInMemory>("WantedItemStore");
export const WANTED_ITEM_REPOSITORY = identifier<WantedItemRepository>("WantedItemRepository");
export const WANTED_ITEMS_DAO = identifier<WantedItemsDao>("WantedItemsDao");
export const AUCTION_PARTICIPATION_REPO = identifier<AuctionParticipationRepository>("AuctionParticipationRepository");
export const NEW_ITEM_CONTROLLER = identifier<NewItemWsController>("NewItemWsController");
export const AUCTION_UPDATE_CONTROLLER = identifier<AuctionUpdateWsController>("AuctionUpdateWsController");
export const ADD_WANTED_ITEM_CONTROLLER = identifier<AddWantedItemHttpController>("AddWantedItemHttpController");
export const EDIT_WANTED_ITEM_CONTROLLER = identifier<EditWantedItemHttpController>("EditWantedItemHttpController");
export const REMOVE_WANTED_ITEM_CONTROLLER = identifier<RemoveWantedItemHttpController>(
    "RemoveWantedItemHttpController",
);
export const TOGGLE_WANTED_ITEM_CONTROLLER = identifier<ToggleWantedItemHttpController>(
    "ToggleWantedItemHttpController",
);
export const ADD_WANTED_ITEM_VALIDATOR = identifier<Validator<AddWantedItemInput>>("AddWantedItemValidator");
export const EDIT_WANTED_ITEM_VALIDATOR = identifier<Validator<EditWantedItemInput>>("EditWantedItemValidator");
export const REMOVE_WANTED_ITEM_VALIDATOR = identifier<Validator<RemoveWantedItemInput>>("RemoveWantedItemValidator");
export const TOGGLE_WANTED_ITEM_VALIDATOR = identifier<Validator<ToggleWantedItemInput>>("ToggleWantedItemValidator");

export const LIST_WANTED_ITEMS_HANDLER =
    identifier<QueryHandler<ListWantedItemsQuery, ListWantedItemsResponse>>("ListWantedItemsHandler");
export const ADD_WANTED_ITEM_HANDLER = identifier<CommandHandler<AddWantedItemCommand>>("AddWantedItemHandler");
export const EDIT_WANTED_ITEM_HANDLER = identifier<CommandHandler<EditWantedItemCommand>>("EditWantedItemHandler");
export const REMOVE_WANTED_ITEM_HANDLER =
    identifier<CommandHandler<RemoveWantedItemCommand>>("RemoveWantedItemHandler");
export const TOGGLE_WANTED_ITEM_HANDLER =
    identifier<CommandHandler<ToggleWantedItemCommand>>("ToggleWantedItemHandler");
export const EVALUATE_ITEM_HANDLER = identifier<CommandHandler<EvaluateItemCommand>>("EvaluateItemHandler");
export const SYNC_ACCOUNT_HANDLER = identifier<CommandHandler<SynchronizeAccountCommand>>("SyncAccountHandler");
export const PLACE_BID_HANDLER = identifier<CommandHandler<PlaceBidCommand>>("PlaceBidHandler");
export const WITHDRAW_ITEM_HANDLER = identifier<CommandHandler<WithdrawItemCommand>>("WithdrawItemHandler");
export const LEAVE_AUCTION_HANDLER = identifier<CommandHandler<LeaveAuctionCommand>>("LeaveAuctionHandler");
export const TRACK_AUCTION_HANDLER = identifier<CommandHandler<TrackAuctionUpdateCommand>>("TrackAuctionUpdateHandler");

export const ON_APPROVED_IN_AUCTION = identifier<EventListener<ItemApprovedInAuctionEvent>>(
    "OnItemApprovedInAuctionPlaceBid",
);
export const ON_APPROVED_OFF_AUCTION = identifier<EventListener<ItemApprovedOffAuctionEvent>>(
    "OnItemApprovedOffAuctionWithdraw",
);
export const ON_OUTBID = identifier<EventListener<OutbidEvent>>("OnOutbidCounterBid");
