import { EnvZodAdapter } from "@/shared/external/environment/env.zod-adapter";
import type { Env } from "@/shared/infrastructure/environment/env";
import { InternalServerError } from "@/shared/infrastructure/http/errors/internal-server.error";

let env: Env;
beforeEach(() => {
    env = new EnvZodAdapter();
});

describe("Env", () => {
    it("Should parse enviroment variables", () => {
        Bun.env.NODE_ENV = "development";
        const result = env.parse(Bun.env);
        expect(result.NODE_ENV).toBe("development");
    });
    it("Should throw an error when the enviroment has a missing key", () => {
        // @ts-expect-error to test
        Bun.env.NODE_ENV = "";
        expect(() => env.parse(Bun.env)).toThrow(
            new InternalServerError('Missing value(s) to enviroment key(s): "NODE_ENV"'),
        );
        Bun.env.CSGOEMPIRE_API_KEY = "";
        expect(() => env.parse(Bun.env)).toThrow(
            new InternalServerError('Missing value(s) to enviroment key(s): "NODE_ENV"; "CSGOEMPIRE_API_KEY"'),
        );
    });
});
