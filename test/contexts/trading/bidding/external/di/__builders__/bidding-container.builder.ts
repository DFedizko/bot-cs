import { Container, type ContainerModule } from "inversify";
import { PackagesModule } from "@/packages/external/di/packages.module";
import { TradingSharedModule } from "@/contexts/trading/shared/external/di/trading-shared.module";
import { CSG_WS_CLIENT, SOCKET_METADATA_HTTP } from "@/contexts/trading/shared/external/di/trading-shared.identifiers";
import { BiddingModule } from "@/contexts/trading/bidding/external/di/bidding.module";
import { BiddingDevModule } from "@/contexts/trading/bidding/external/di/bidding.dev-module";
import { BiddingProdModule } from "@/contexts/trading/bidding/external/di/bidding.prod-module";
import {
    CSGOEMPIRE_AUCTION_HTTP,
    CSGOEMPIRE_TRADE_HTTP,
} from "@/contexts/trading/bidding/external/di/bidding.identifiers";
import { SocketMetadataHttpFakeAdapter } from "@/contexts/trading/shared/external/csgoempire/http/socket-metadata.http.fake-adapter";
import { CsgWsClientFakeAdapter } from "@/contexts/trading/shared/external/csgoempire/csg-ws-client.fake-adapter";
import { CsgoempireAuctionHttpFakeAdapter } from "../../http/csgoempire/csgoempire-auction.http.fake-adapter";
import { CsgoempireTradeHttpFakeAdapter } from "../../http/csgoempire/csgoempire-trade.http.fake-adapter";

const API_KEY = "api-key";
const FAKE_WS_URL = "ws://localhost";

type BiddingEnv = Exclude<AppEnv["NODE_ENV"], "test">;

const BIDDING_ENV_MODULES: Record<BiddingEnv, () => ContainerModule> = {
    development: () => new BiddingDevModule(),
    production: () => new BiddingProdModule(),
};

export const biddingContainer = (nodeEnv: BiddingEnv): Container => {
    const container = new Container();
    container.load(
        new PackagesModule({ NODE_ENV: nodeEnv, CSGOEMPIRE_API_KEY: API_KEY }),
        new TradingSharedModule(),
        new BiddingModule(),
        BIDDING_ENV_MODULES[nodeEnv](),
    );
    return container;
};

export const fakeExternals = (container: Container): Container => {
    container.rebind(SOCKET_METADATA_HTTP).toConstantValue(new SocketMetadataHttpFakeAdapter());
    container.rebind(CSG_WS_CLIENT).toConstantValue(new CsgWsClientFakeAdapter(FAKE_WS_URL, { autoConnect: false }));
    container.rebind(CSGOEMPIRE_AUCTION_HTTP).toConstantValue(new CsgoempireAuctionHttpFakeAdapter());
    container.rebind(CSGOEMPIRE_TRADE_HTTP).toConstantValue(new CsgoempireTradeHttpFakeAdapter());
    return container;
};
