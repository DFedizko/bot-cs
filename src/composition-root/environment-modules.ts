import type { ContainerModule } from "inversify";
import { BiddingDevModule } from "@/contexts/trading/bidding/external/di/bidding.dev-module";
import { BiddingProdModule } from "@/contexts/trading/bidding/external/di/bidding.prod-module";

const DEVELOPMENT_MODULES = (): ContainerModule[] => [new BiddingDevModule()];
const PRODUCTION_MODULES = (): ContainerModule[] => [new BiddingProdModule()];

export const ENVIRONMENT_MODULES: Record<AppEnv["NODE_ENV"], () => ContainerModule[]> = {
    test: DEVELOPMENT_MODULES,
    development: DEVELOPMENT_MODULES,
    production: PRODUCTION_MODULES,
};
