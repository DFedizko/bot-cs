import z from "zod";

const MIN_PORT = 1;
const MAX_PORT = 65535;
const MIN_CHECK_INTERVAL_SECONDS = 15;

export const envSchema = z.object({
    NODE_ENV: z.enum(["test", "development", "production"]),
    CSGOEMPIRE_API_KEY: z.string().min(1),
    HTTP_PORT: z.coerce.number().int().min(MIN_PORT).max(MAX_PORT),
    STEAM_ACCOUNTS: z.string().min(1).optional(),
    DELIVERY_CHECK_INTERVAL_SECONDS: z.coerce.number().int().min(MIN_CHECK_INTERVAL_SECONDS).optional(),
    DELIVERY_MAX_WAIT_MINUTES: z.coerce.number().int().positive().optional(),
}) satisfies z.ZodType<AppEnv>;
