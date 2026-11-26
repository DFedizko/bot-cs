import { identifier } from "@/packages/external/di/identifier";
import type { CsgDepositWsClient } from "../../infrastructure/ws/csgoempire/csg-deposit.ws-client";
import type { RawCsgEventsSink } from "../../infrastructure/capture/raw-csg-events.sink";
import type { RawCsgEventsCaptureWsController } from "../../infrastructure/controllers/raw-csg-events-capture.ws-controller";

export const CSG_DEPOSIT_WS_CLIENT = identifier<CsgDepositWsClient>("CsgDepositWsClient");
export const RAW_CSG_EVENTS_SINK = identifier<RawCsgEventsSink>("RawCsgEventsSink");
export const RAW_CSG_CAPTURE_CONTROLLER = identifier<RawCsgEventsCaptureWsController>(
    "RawCsgEventsCaptureWsController",
);
