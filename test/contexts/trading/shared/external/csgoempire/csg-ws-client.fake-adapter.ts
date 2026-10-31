import type { CsgWsClient } from "@/contexts/trading/shared/infrastructure/csgoempire/csg.ws-client";
import { WsClientSocketIoAdapter } from "@/packages/external/web-socket/client/ws-client.socket-io-adapter";

export class CsgWsClientFakeAdapter extends WsClientSocketIoAdapter implements CsgWsClient {
    readonly accountId = 1;
}
