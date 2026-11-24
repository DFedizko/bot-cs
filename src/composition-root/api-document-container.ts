import { Container } from "inversify";
import { PackagesModule } from "@/packages/external/di/packages.module";
import { PackagesDevModule } from "@/packages/external/di/packages.dev-module";
import { HTTP_MODULES } from "./http-modules";

const UNUSED_API_KEY = "";
const UNUSED_PORT = 0;
const DOCUMENTED_ENV: AppEnv = {
    NODE_ENV: "development",
    CSGOEMPIRE_API_KEY: UNUSED_API_KEY,
    HTTP_PORT: UNUSED_PORT,
};

export class ApiDocumentContainer extends Container {
    constructor() {
        super();
        this.load(new PackagesModule(DOCUMENTED_ENV), ...HTTP_MODULES(), new PackagesDevModule());
    }
}
