import type { RawCsgEventRecord } from "./raw-csg-event-record";

export interface RawCsgEventsSink {
    append(record: RawCsgEventRecord): Promise<void>;
}
