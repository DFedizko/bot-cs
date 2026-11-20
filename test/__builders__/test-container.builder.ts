import type { Container } from "inversify";
import { RootContainer } from "@/composition-root/root-container";
import { fakeExternals } from "./externals.builder";

const API_KEY = "api-key";
const ANY_FREE_PORT = 0;
const REAL_GATEWAYS_ENV = "production";

export const testContainer = (nodeEnv: AppEnv["NODE_ENV"] = REAL_GATEWAYS_ENV): Container =>
    fakeExternals(new RootContainer({ NODE_ENV: nodeEnv, CSGOEMPIRE_API_KEY: API_KEY, HTTP_PORT: ANY_FREE_PORT }));
