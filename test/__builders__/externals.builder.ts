import type { Container } from "inversify";
import { CSG_WS_CLIENT, SOCKET_METADATA_HTTP } from "@/contexts/trading/shared/external/di/trading-shared.identifiers";
import {
    CSGOEMPIRE_AUCTION_HTTP,
    CSGOEMPIRE_TRADE_HTTP,
} from "@/contexts/trading/bidding/external/di/bidding.identifiers";
import { SocketMetadataHttpFakeAdapter } from "@/contexts/trading/shared/external/csgoempire/http/socket-metadata.http.fake-adapter";
import { CsgWsClientFakeAdapter } from "@/contexts/trading/shared/external/csgoempire/csg-ws-client.fake-adapter";
import { CsgoempireAuctionHttpFakeAdapter } from "@/contexts/trading/bidding/external/http/csgoempire/csgoempire-auction.http.fake-adapter";
import { CsgoempireTradeHttpFakeAdapter } from "@/contexts/trading/bidding/external/http/csgoempire/csgoempire-trade.http.fake-adapter";
import {
    CLOCK,
    CSG_DELIVERY_HTTP,
    SCHEDULER,
    STEAM_SESSIONS,
} from "@/contexts/delivery/external/di/delivery.identifiers";
import { SchedulerFakeAdapter } from "@/contexts/delivery/external/scheduling/scheduler.fake-adapter";
import { ClockFakeAdapter } from "@/contexts/delivery/external/scheduling/clock.fake-adapter";
import { SteamSessionsFakeAdapter } from "@/contexts/delivery/external/steam/steam-sessions.fake-adapter";
import { CsgDeliveryHttpFakeAdapter } from "@/contexts/delivery/external/http/csgoempire/csg-delivery.http.fake-adapter";

const FAKE_WS_URL = "ws://localhost";

export const fakeExternals = (container: Container): Container => {
    container.rebind(SOCKET_METADATA_HTTP).toConstantValue(new SocketMetadataHttpFakeAdapter());
    container.rebind(CSG_WS_CLIENT).toConstantValue(new CsgWsClientFakeAdapter(FAKE_WS_URL, { autoConnect: false }));
    container.rebind(CSGOEMPIRE_AUCTION_HTTP).toConstantValue(new CsgoempireAuctionHttpFakeAdapter());
    container.rebind(CSGOEMPIRE_TRADE_HTTP).toConstantValue(new CsgoempireTradeHttpFakeAdapter());
    container.rebind(STEAM_SESSIONS).toConstantValue(new SteamSessionsFakeAdapter());
    container.rebind(CSG_DELIVERY_HTTP).toConstantValue(new CsgDeliveryHttpFakeAdapter());
    container.rebind(SCHEDULER).toConstantValue(new SchedulerFakeAdapter());
    container.rebind(CLOCK).toConstantValue(new ClockFakeAdapter());
    return container;
};
