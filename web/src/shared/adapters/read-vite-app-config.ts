import type { AppConfig } from "@/shared/lib/config/app-config";

export type ViteEnv = Readonly<Record<string, string | boolean | undefined>>;

const BOT_API_URL_KEY = "VITE_BOT_API_URL";
const LOCAL_BOT_API_URL = "http://localhost:3000";

const readString = (value: ViteEnv[string]) => (typeof value === "string" && value ? value : undefined);

export function readViteAppConfig(env: ViteEnv = import.meta.env): AppConfig {
    return { botApiUrl: readString(env[BOT_API_URL_KEY]) ?? LOCAL_BOT_API_URL };
}
