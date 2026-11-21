import { Container, type ContainerModule } from "inversify";
import { PackagesModule } from "@/packages/external/di/packages.module";
import { TradingSharedModule } from "@/contexts/trading/shared/external/di/trading-shared.module";
import { DeliveryModule } from "@/contexts/delivery/external/di/delivery.module";
import { DeliveryTrackingModule } from "@/contexts/delivery/external/di/delivery-tracking.module";
import { DeliveryDevModule } from "@/contexts/delivery/external/di/delivery.dev-module";
import { DeliveryProdModule } from "@/contexts/delivery/external/di/delivery.prod-module";

const API_KEY = "api-key";
const ANY_FREE_PORT = 0;

export type DeliveryEnv = Exclude<AppEnv["NODE_ENV"], "test">;

const DELIVERY_ENV_MODULES: Record<DeliveryEnv, () => ContainerModule> = {
    development: () => new DeliveryDevModule(),
    production: () => new DeliveryProdModule(),
};

export const deliveryContainer = (nodeEnv: DeliveryEnv, env: Partial<AppEnv> = {}): Container => {
    const container = new Container();
    container.load(
        new PackagesModule({ NODE_ENV: nodeEnv, CSGOEMPIRE_API_KEY: API_KEY, HTTP_PORT: ANY_FREE_PORT, ...env }),
        new TradingSharedModule(),
        new DeliveryModule(),
        new DeliveryTrackingModule(),
        DELIVERY_ENV_MODULES[nodeEnv](),
    );
    return container;
};
