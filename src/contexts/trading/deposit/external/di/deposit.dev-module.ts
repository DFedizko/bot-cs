import { ContainerModule } from "inversify";
import { CLOCK, LOGGER } from "@/packages/external/di/packages.identifiers";
import type { Clock } from "@/packages/application/clock";
import type { Logger } from "@/packages/application/logger";
import type { CsgDepositWsClient } from "../../infrastructure/ws/csgoempire/csg-deposit.ws-client";
import type { RawCsgEventsSink } from "../../infrastructure/capture/raw-csg-events.sink";
import { RawCsgEventsCaptureWsController } from "../../infrastructure/controllers/raw-csg-events-capture.ws-controller";
import { CSG_DEPOSIT_WS_CLIENT, RAW_CSG_CAPTURE_CONTROLLER, RAW_CSG_EVENTS_SINK } from "./deposit.identifiers";

export class DepositDevModule extends ContainerModule {
    constructor() {
        super(({ bind }) => {
            bind(RAW_CSG_CAPTURE_CONTROLLER)
                .toResolvedValue(
                    (wsClient: CsgDepositWsClient, sink: RawCsgEventsSink, clock: Clock, logger: Logger) =>
                        new RawCsgEventsCaptureWsController(wsClient, sink, clock, logger),
                    [CSG_DEPOSIT_WS_CLIENT, RAW_CSG_EVENTS_SINK, CLOCK, LOGGER],
                )
                .inSingletonScope();
        });
    }
}
