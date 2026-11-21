import type { Container } from "inversify";
import { RootContainer } from "@/composition-root/root-container";
import { fakeExternals } from "./externals.builder";

const API_KEY = "api-key";
const ANY_FREE_PORT = 0;
const REAL_GATEWAYS_ENV = "production";
const STEAM_ACCOUNTS = JSON.stringify([
    {
        accountId: 303119,
        username: "buyer",
        password: "test-password",
        sharedSecret: "c2hhcmVkLXNlY3JldA==",
        identitySecret: "aWRlbnRpdHktc2VjcmV0",
    },
    {
        accountId: 404220,
        username: "second-buyer",
        password: "second-password",
        sharedSecret: "c2Vjb25kLXNoYXJlZA==",
        identitySecret: "c2Vjb25kLWlkZW50aXR5",
    },
]);

export const testContainer = (nodeEnv: AppEnv["NODE_ENV"] = REAL_GATEWAYS_ENV): Container =>
    fakeExternals(
        new RootContainer({ NODE_ENV: nodeEnv, CSGOEMPIRE_API_KEY: API_KEY, HTTP_PORT: ANY_FREE_PORT, STEAM_ACCOUNTS }),
    );
