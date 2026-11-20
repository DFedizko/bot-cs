import { EnvZodAdapter } from "@/packages/external/environment/env.zod-adapter";
import type { Env } from "@/packages/infrastructure/environment/env";
import { InternalServerError } from "@/packages/infrastructure/http/errors/internal-server.error";

const API_KEY = "api-key";
const HTTP_PORT = "3000";
const RUNTIME_ENV = { NODE_ENV: "production", CSGOEMPIRE_API_KEY: API_KEY, HTTP_PORT };

let env: Env;

beforeEach(() => {
    env = new EnvZodAdapter(RUNTIME_ENV);
});

describe("Env", () => {
    it("Should parse enviroment variables", () => {
        const result = env.parse({ NODE_ENV: "development", CSGOEMPIRE_API_KEY: API_KEY, HTTP_PORT });
        expect(result.NODE_ENV).toBe("development");
    });
    it("Should parse the http port as a number", () => {
        const result = env.parse({ NODE_ENV: "development", CSGOEMPIRE_API_KEY: API_KEY, HTTP_PORT });

        expect(result.HTTP_PORT).toBe(Number(HTTP_PORT));
    });
    it("Should throw an error when the http port is not a port number", () => {
        const parse = () => env.parse({ NODE_ENV: "development", CSGOEMPIRE_API_KEY: API_KEY, HTTP_PORT: "http" });

        expect(parse).toThrow(new InternalServerError('Missing value(s) to enviroment key(s): "HTTP_PORT"'));
    });
    it("Should throw an error when the http port is missing", () => {
        const parse = () => env.parse({ NODE_ENV: "development", CSGOEMPIRE_API_KEY: API_KEY });

        expect(parse).toThrow(new InternalServerError('Missing value(s) to enviroment key(s): "HTTP_PORT"'));
    });
    it("Should throw an error when the enviroment has a missing key", () => {
        expect(() => env.parse({ NODE_ENV: "", CSGOEMPIRE_API_KEY: API_KEY, HTTP_PORT })).toThrow(
            new InternalServerError('Missing value(s) to enviroment key(s): "NODE_ENV"'),
        );
        expect(() => env.parse({ NODE_ENV: "", CSGOEMPIRE_API_KEY: "", HTTP_PORT })).toThrow(
            new InternalServerError('Missing value(s) to enviroment key(s): "NODE_ENV"; "CSGOEMPIRE_API_KEY"'),
        );
    });
    it("Should keep the optional steam accounts", () => {
        const result = env.parse({ NODE_ENV: "production", CSGOEMPIRE_API_KEY: API_KEY, STEAM_ACCOUNTS: "[]" });

        expect(result.STEAM_ACCOUNTS).toBe("[]");
    });
    it("Should load the enviroment variables from the runtime", () => {
        const result = env.load();

        expect(result).toEqual({ NODE_ENV: "production", CSGOEMPIRE_API_KEY: API_KEY, HTTP_PORT: Number(HTTP_PORT) });
    });
});
