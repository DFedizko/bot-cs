import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { RawCsgEventsSinkJsonlFileAdapter } from "@/contexts/trading/deposit/external/capture/raw-csg-events.sink.jsonl-file-adapter";
import type { RawCsgEventRecord } from "@/contexts/trading/deposit/infrastructure/capture/raw-csg-event-record";

const FOLDER_PREFIX = "csg-capture-";
const CAPTURE_FOLDER = join("captures", "csgoempire");
const ENCODING = "utf8";
const FIRST_DAY = "2026-11-26";
const NEXT_DAY = "2026-11-27";
const ACCOUNT_ID = 303119;

const record = (capturedAt: string, event = "trade_status"): RawCsgEventRecord => ({
    capturedAt,
    accountId: ACCOUNT_ID,
    event,
    payload: [{ type: "deposit", data: { id: 1, status: 0 } }],
});

const readLines = async (day: string): Promise<RawCsgEventRecord[]> =>
    (await readFile(join(folder, CAPTURE_FOLDER, `${day}.jsonl`), ENCODING))
        .trim()
        .split("\n")
        .map((line) => JSON.parse(line) as RawCsgEventRecord);

let folder: string;

describe("RawCsgEventsSinkJsonlFileAdapter", () => {
    beforeEach(async () => {
        folder = await mkdtemp(join(tmpdir(), FOLDER_PREFIX));
    });

    afterEach(async () => {
        await rm(folder, { recursive: true, force: true });
    });

    it("Should write each record as one JSON line in the file of its day", async () => {
        const sink = new RawCsgEventsSinkJsonlFileAdapter(join(folder, CAPTURE_FOLDER));

        await sink.append(record(`${FIRST_DAY}T10:00:00.000Z`));

        expect(await readLines(FIRST_DAY)).toEqual([record(`${FIRST_DAY}T10:00:00.000Z`)]);
    });

    it("Should append to the records already captured that day", async () => {
        const sink = new RawCsgEventsSinkJsonlFileAdapter(join(folder, CAPTURE_FOLDER));
        await sink.append(record(`${FIRST_DAY}T10:00:00.000Z`));

        await sink.append(record(`${FIRST_DAY}T10:05:00.000Z`, "deposit_failed"));

        expect((await readLines(FIRST_DAY)).map(({ event }) => event)).toEqual(["trade_status", "deposit_failed"]);
    });

    it("Should start a new file on the next day", async () => {
        const sink = new RawCsgEventsSinkJsonlFileAdapter(join(folder, CAPTURE_FOLDER));
        await sink.append(record(`${FIRST_DAY}T23:59:59.000Z`));

        await sink.append(record(`${NEXT_DAY}T00:00:01.000Z`));

        expect(await readLines(NEXT_DAY)).toEqual([record(`${NEXT_DAY}T00:00:01.000Z`)]);
    });
});
