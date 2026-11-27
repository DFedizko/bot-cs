import { appendFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { RawCsgEventsSink } from "../../infrastructure/capture/raw-csg-events.sink";
import type { RawCsgEventRecord } from "../../infrastructure/capture/raw-csg-event-record";

const DATE_LENGTH = "YYYY-MM-DD".length;
const JSONL_EXTENSION = ".jsonl";
const LINE_BREAK = "\n";

export class RawCsgEventsSinkJsonlFileAdapter implements RawCsgEventsSink {
    constructor(private readonly directory: string) {}

    async append(record: RawCsgEventRecord): Promise<void> {
        await mkdir(this.directory, { recursive: true });
        await appendFile(this.fileFor(record), JSON.stringify(record) + LINE_BREAK);
    }

    private fileFor(record: RawCsgEventRecord): string {
        return join(this.directory, record.capturedAt.slice(0, DATE_LENGTH) + JSONL_EXTENSION);
    }
}
