declare global {
    interface AppEnv {
        NODE_ENV: "test" | "development" | "production";
        CSGOEMPIRE_API_KEY: string;
        HTTP_PORT: number;
        STEAM_ACCOUNTS?: string;
        DELIVERY_CHECK_INTERVAL_SECONDS?: number;
        DELIVERY_MAX_WAIT_MINUTES?: number;
    }
    namespace NodeJS {
        interface ProcessEnv extends Partial<Record<keyof AppEnv, string>> {}
    }
}

export {};
