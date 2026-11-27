import type { RawCsgEventsSink } from "@/contexts/trading/deposit/infrastructure/capture/raw-csg-events.sink";
import type { RawCsgEventRecord } from "@/contexts/trading/deposit/infrastructure/capture/raw-csg-event-record";

export const SINK_FAILURE = "disk full";

export class RawCsgEventsSinkFakeAdapter implements RawCsgEventsSink {
    readonly records: RawCsgEventRecord[] = [];

    constructor(private readonly failing = false) {}

    async append(record: RawCsgEventRecord): Promise<void> {
        if (this.failing) throw new Error(SINK_FAILURE);
        this.records.push(structuredClone(record));
    }
}
