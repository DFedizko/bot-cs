import { Container } from "inversify";
import { PackagesModule } from "@/packages/external/di/packages.module";
import { TradingSharedModule } from "@/contexts/trading/shared/external/di/trading-shared.module";
import { BiddingModule } from "@/contexts/trading/bidding/external/di/bidding.module";
import { ENVIRONMENT_MODULES } from "./environment-modules";

export class RootContainer extends Container {
    constructor(env: AppEnv) {
        super();
        this.load(
            new PackagesModule(env),
            new TradingSharedModule(),
            new BiddingModule(),
            ...ENVIRONMENT_MODULES[env.NODE_ENV](),
        );
    }
}
