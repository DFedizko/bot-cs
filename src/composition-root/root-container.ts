import { Container } from "inversify";
import { PackagesModule } from "@/packages/external/di/packages.module";
import { TradingSharedModule } from "@/contexts/trading/shared/external/di/trading-shared.module";
import { BiddingModule } from "@/contexts/trading/bidding/external/di/bidding.module";
import { DeliveryModule } from "@/contexts/delivery/external/di/delivery.module";
import { DeliveryTrackingModule } from "@/contexts/delivery/external/di/delivery-tracking.module";
import { DepositModule } from "@/contexts/trading/deposit/external/di/deposit.module";
import { CatalogModule } from "@/contexts/catalog/external/di/catalog.module";
import { ENVIRONMENT_MODULES } from "./environment-modules";
import { HTTP_MODULES } from "./http-modules";

export class RootContainer extends Container {
    constructor(env: AppEnv) {
        super();
        this.load(
            new PackagesModule(env),
            new TradingSharedModule(),
            new BiddingModule(),
            ...HTTP_MODULES(),
            new DeliveryModule(),
            new DeliveryTrackingModule(),
            new DepositModule(),
            new CatalogModule(),
            ...ENVIRONMENT_MODULES[env.NODE_ENV](),
        );
    }
}
