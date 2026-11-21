declare global {
    interface AppEnv {
        NODE_ENV: "test" | "development" | "production";
        CSGOEMPIRE_API_KEY: string;
        HTTP_PORT: number;
        STEAM_ACCOUNTS?: string;
    }
    namespace NodeJS {
        interface ProcessEnv extends Partial<Record<keyof AppEnv, string>> {}
    }
}

export {};
