import { Container, type ContainerModule } from "inversify";
import { PackagesModule } from "@/packages/external/di/packages.module";
import { TradingSharedModule } from "@/contexts/trading/shared/external/di/trading-shared.module";
import { BiddingModule } from "@/contexts/trading/bidding/external/di/bidding.module";
import { BiddingDevModule } from "@/contexts/trading/bidding/external/di/bidding.dev-module";
import { BiddingProdModule } from "@/contexts/trading/bidding/external/di/bidding.prod-module";

const API_KEY = "api-key";

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
