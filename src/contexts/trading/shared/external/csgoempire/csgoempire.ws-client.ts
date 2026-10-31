import { WsClientSocketIoAdapter } from "@/packages/external/web-socket/client/ws-client.socket-io-adapter";
import type { CsgWsClient } from "../../infrastructure/csgoempire/csg.ws-client";

const SOCKET_ENDPOINT = "wss://trade.csgoempire.com/trade";

export type CsgoempireUserData = {
    id: number;
    socketToken: string;
};

export class CsgoempireWsClient extends WsClientSocketIoAdapter implements CsgWsClient {
    readonly accountId: number;
    constructor(csgoempireUserData: CsgoempireUserData) {
        super(SOCKET_ENDPOINT, {
            transports: ["websocket"],
            path: "/s/",
            secure: true,
            rejectUnauthorized: false,
            reconnection: true,
            query: {
                uid: csgoempireUserData.id,
                token: csgoempireUserData.socketToken,
            },
            extraHeaders: { "User-agent": `${csgoempireUserData.id} API Bot` },
        });
        this.accountId = csgoempireUserData.id;
    }
}
