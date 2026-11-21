import type { WsClient } from "@/packages/infrastructure/web-socket/ws-client";

export interface CsgDeliveryWsClient extends Pick<WsClient, "on"> {
    accountId: number;
}
