import type { Env } from "@/shared/infrastructure/environment/env";
import { envSchema } from "./env.schema";
import { InternalServerError } from "@/shared/infrastructure/http/errors/internal-server.error";
import type { ZodError } from "zod";

export class EnvZodAdapter implements Env {
    parse(env: NodeJS.ProcessEnv): AppEnv {
        const result = envSchema.safeParse(env);
        if (!result.success)
            throw new InternalServerError(
                `Missing value(s) to enviroment key(s): ${this.formatErrorMessage(result.error)}`,
            );
        return result.data;
    }

    private formatErrorMessage(error: ZodError): string {
        return error.issues.map((issue) => `"${issue.path}"`).join("; ");
    }
}
