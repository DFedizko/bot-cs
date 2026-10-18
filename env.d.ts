declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: "development" | "production";
            CSGOEMPIRE_API_KEY: string;
        }
    }
}

export {};
