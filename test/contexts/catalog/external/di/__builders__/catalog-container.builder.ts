import { Container } from "inversify";
import { PackagesModule } from "@/packages/external/di/packages.module";
import { CatalogModule } from "@/contexts/catalog/external/di/catalog.module";

const API_KEY = "api-key";
const ANY_FREE_PORT = 0;

export type CatalogEnv = Exclude<AppEnv["NODE_ENV"], "test">;

export const catalogContainer = (nodeEnv: CatalogEnv = "production"): Container => {
    const container = new Container();
    container.load(
        new PackagesModule({ NODE_ENV: nodeEnv, CSGOEMPIRE_API_KEY: API_KEY, HTTP_PORT: ANY_FREE_PORT }),
        new CatalogModule(),
    );
    return container;
};
