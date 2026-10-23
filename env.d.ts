declare global {
	interface AppEnv {	
        NODE_ENV: "test" | "development" | "production";
		CSGOEMPIRE_API_KEY: string;
	}
    namespace NodeJS {
		interface ProcessEnv extends AppEnv {}
    }
}

export {};
