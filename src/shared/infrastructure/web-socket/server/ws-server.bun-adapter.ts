import { HttpStatus } from "../../http/http-status";
import type { Socket, WsServer } from "./ws-server";

export class WsServerBunAdapter implements WsServer {
    public readonly server: Bun.Server<undefined>;
    private connectionCallbacks: ((socket: Socket) => void)[] = [];

    constructor(port: number) {
        this.server = Bun.serve({
            fetch(req, server) {
                if (server.upgrade(req)) return;
                return new Response("Upgrade failed", { status: HttpStatus.INTERNAL_SERVER_ERROR });
            },
            port,
            websocket: {
                open: (ws) => {
                    ws.subscribe("all");
                    const socket: Socket = { send: (event, data) => ws.send(JSON.stringify({ event, data })) };
                    this.connectionCallbacks.forEach((callbackfn) => callbackfn(socket));
                },
                message() {},
            },
        });
    }

    on(_event: "connection", callback: (socket: Socket) => void): void {
        this.connectionCallbacks.push(callback);
    }

    emit<T = unknown>(event: string, data: T): void {
        this.server.publish("all", JSON.stringify({ event, data }));
    }

    async close(): Promise<void> {
        await this.server.stop(true);
    }

    get port(): number {
        return this.server.port!;
    }
}
