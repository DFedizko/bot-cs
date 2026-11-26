import { ContainerModule } from "inversify";
import { CSG_WS_CLIENT } from "@/contexts/trading/shared/external/di/trading-shared.identifiers";
import { RawCsgEventsSinkJsonlFileAdapter } from "../capture/raw-csg-events.sink.jsonl-file-adapter";
import { CSG_DEPOSIT_WS_CLIENT, RAW_CSG_EVENTS_SINK } from "./deposit.identifiers";

export const RAW_CSG_CAPTURE_DIRECTORY = "captures/csgoempire";

export class DepositModule extends ContainerModule {
    constructor() {
        super(({ bind }) => {
            bind(CSG_DEPOSIT_WS_CLIENT).toService(CSG_WS_CLIENT);
            bind(RAW_CSG_EVENTS_SINK)
                .toResolvedValue(() => new RawCsgEventsSinkJsonlFileAdapter(RAW_CSG_CAPTURE_DIRECTORY))
                .inSingletonScope();
        });
    }
}
