import z from "zod";

export const envSchema = z.object({
    NODE_ENV: z.enum(["test", "development", "production"]),
    CSGOEMPIRE_API_KEY: z.string().min(1),
}) satisfies z.ZodType<AppEnv>;
