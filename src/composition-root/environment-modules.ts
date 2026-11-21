import type { ContainerModule } from "inversify";
import { PackagesDevModule } from "@/packages/external/di/packages.dev-module";
import { BiddingDevModule } from "@/contexts/trading/bidding/external/di/bidding.dev-module";
import { BiddingProdModule } from "@/contexts/trading/bidding/external/di/bidding.prod-module";
import { DeliveryDevModule } from "@/contexts/delivery/external/di/delivery.dev-module";
import { DeliveryProdModule } from "@/contexts/delivery/external/di/delivery.prod-module";

const DEVELOPMENT_MODULES = (): ContainerModule[] => [
    new PackagesDevModule(),
    new BiddingDevModule(),
    new DeliveryDevModule(),
];
const PRODUCTION_MODULES = (): ContainerModule[] => [new BiddingProdModule(), new DeliveryProdModule()];

export const ENVIRONMENT_MODULES: Record<AppEnv["NODE_ENV"], () => ContainerModule[]> = {
    test: DEVELOPMENT_MODULES,
    development: DEVELOPMENT_MODULES,
    production: PRODUCTION_MODULES,
};
