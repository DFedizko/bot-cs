import type { WsClient } from "@/packages/infrastructure/web-socket/ws-client";

export interface CsgDepositWsClient extends Pick<WsClient, "on"> {
    accountId: number;
}
