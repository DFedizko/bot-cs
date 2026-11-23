import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { FileWriterBunAdapter } from "@/packages/external/file/file-writer.bun-adapter";

const FOLDER_PREFIX = "file-writer-";
const FILE_NAME = "foo.json";
const NESTED_FILE = join("nested", "folder", FILE_NAME);
const CONTENT = '{"foo":"bar"}';
const ENCODING = "utf8";

let folder: string;

describe("FileWriterBunAdapter", () => {
    beforeEach(async () => {
        folder = await mkdtemp(join(tmpdir(), FOLDER_PREFIX));
    });

    afterEach(async () => {
        await rm(folder, { recursive: true, force: true });
    });

    it("Should write the content to the given path", async () => {
        const path = join(folder, FILE_NAME);

        await new FileWriterBunAdapter().write(path, CONTENT);

        expect(await readFile(path, ENCODING)).toBe(CONTENT);
    });

    it("Should create the missing folders of the path", async () => {
        const path = join(folder, NESTED_FILE);

        await new FileWriterBunAdapter().write(path, CONTENT);

        expect(await readFile(path, ENCODING)).toBe(CONTENT);
    });
});
