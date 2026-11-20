import type { Env } from "@/packages/infrastructure/environment/env";
import { envSchema } from "./env.schema";
import { InternalServerError } from "@/packages/infrastructure/http/errors/internal-server.error";
import type { ZodError } from "zod";

type EnvSource = Record<string, string | undefined>;

export class EnvZodAdapter implements Env {
    constructor(private readonly runtimeEnv: EnvSource = Bun.env) {}

    parse(env: EnvSource): AppEnv {
        const result = envSchema.safeParse(env);
        if (!result.success)
            throw new InternalServerError(
                `Missing value(s) to enviroment key(s): ${this.formatErrorMessage(result.error)}`,
            );
        return result.data;
    }

    load(): AppEnv {
        return this.parse(this.runtimeEnv);
    }

    private formatErrorMessage(error: ZodError): string {
        return error.issues.map((issue) => `"${issue.path}"`).join("; ");
    }
}
