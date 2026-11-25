import type { ContainerModule } from "inversify";
import { BiddingHttpModule } from "@/contexts/trading/bidding/external/di/bidding-http.module";
import { CatalogHttpModule } from "@/contexts/catalog/external/di/catalog-http.module";

export const HTTP_MODULES = (): ContainerModule[] => [new BiddingHttpModule(), new CatalogHttpModule()];
