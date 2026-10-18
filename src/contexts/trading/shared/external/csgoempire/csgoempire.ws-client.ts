import { WsClientSocketIoAdapter } from "@/shared/external/web-socket/client/ws-client.socket-io-adapter";

const SOCKET_ENDPOINT = "wss://trade.csgoempire.com/trade";

export class CsgoempireWsClient extends WsClientSocketIoAdapter {
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
    }
}
