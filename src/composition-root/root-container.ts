import { Container } from "inversify";
import { PackagesModule } from "@/packages/external/di/packages.module";
import { TradingSharedModule } from "@/contexts/trading/shared/external/di/trading-shared.module";
import { BiddingModule } from "@/contexts/trading/bidding/external/di/bidding.module";
import { BiddingHttpModule } from "@/contexts/trading/bidding/external/di/bidding-http.module";
import { DeliveryModule } from "@/contexts/delivery/external/di/delivery.module";
import { DeliveryTrackingModule } from "@/contexts/delivery/external/di/delivery-tracking.module";
import { ENVIRONMENT_MODULES } from "./environment-modules";

export class RootContainer extends Container {
    constructor(env: AppEnv) {
        super();
        this.load(
            new PackagesModule(env),
            new TradingSharedModule(),
            new BiddingModule(),
            new BiddingHttpModule(),
            new DeliveryModule(),
            new DeliveryTrackingModule(),
            ...ENVIRONMENT_MODULES[env.NODE_ENV](),
        );
    }
}
