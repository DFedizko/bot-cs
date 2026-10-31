import type { WsClient } from "@/packages/infrastructure/web-socket/ws-client";

export interface CsgWsClient extends WsClient {
    accountId: number;
}
