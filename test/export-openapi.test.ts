import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { exportedApiDocument } from "@/composition-root/__builders__/exported-api-document.builder";

const ENTRY_POINT = join(import.meta.dir, "..", "src", "export-openapi.ts");
const FOLDER_PREFIX = "export-openapi-";
const DEFAULT_OUTPUT = "openapi.json";
const GIVEN_OUTPUT = join("api", "bot.json");
const ENCODING = "utf8";
const SUCCESS = 0;
const OFFLINE_ENV = { PATH: Bun.env.PATH };

const runExport = (cwd: string, args: string[]): Promise<number> =>
    Bun.spawn([process.execPath, ENTRY_POINT, ...args], { cwd, env: OFFLINE_ENV, stdout: "ignore" }).exited;

let folder: string;

describe("export-openapi", () => {
    beforeEach(async () => {
        folder = await mkdtemp(join(tmpdir(), FOLDER_PREFIX));
    });

    afterEach(async () => {
        await rm(folder, { recursive: true, force: true });
    });

    it("Should exit cleanly without a CSGOEmpire key", async () => {
        const exitCode = await runExport(folder, []);

        expect(exitCode).toBe(SUCCESS);
    });

    it("Should write the api document to openapi.json by default", async () => {
        await runExport(folder, []);

        expect(await readFile(join(folder, DEFAULT_OUTPUT), ENCODING)).toBe(await exportedApiDocument());
    });

    it("Should write the api document to the given path", async () => {
        await runExport(folder, [GIVEN_OUTPUT]);

        expect(await readFile(join(folder, GIVEN_OUTPUT), ENCODING)).toBe(await exportedApiDocument());
    });
});
