import type { Socket, WsServer } from "../../../infrastructure/web-socket/ws-server";

type Callback = (data: any) => void;

export class WsServerBunAdapter implements WsServer {
    private server?: Bun.Server<undefined>;
    private connectionCallbacks: ((socket: Socket) => void)[] = [];
    private sockets = new WeakMap<Bun.ServerWebSocket<undefined>, Map<string, Callback[]>>();

    readonly websocket: Bun.WebSocketHandler<undefined> = {
        open: (ws) => {
            ws.subscribe("all");
            const handlers = new Map<string, Callback[]>();
            this.sockets.set(ws, handlers);
            const socket: Socket = {
                emit: (event, data) => ws.send(JSON.stringify({ event, data })),
                on: (event, callback) => handlers.set(event, [...(handlers.get(event) ?? []), callback]),
            };
            this.connectionCallbacks.forEach((callback) => callback(socket));
        },
        message: (ws, message) => {
            const { event, data } = JSON.parse(String(message));
            this.sockets
                .get(ws)
                ?.get(event)
                ?.forEach((callback) => callback(data));
        },
    };

    attatch(server: Bun.Server<undefined>): void {
        this.server = server;
    }

    upgrade(req: Request, server: Bun.Server<undefined>): boolean {
        return server.upgrade(req);
    }

    on(_event: "connection" | string, callback: (socket: Socket) => void): void {
        this.connectionCallbacks.push(callback);
    }

    emit<T = unknown>(event: string, data: T): void {
        this.server?.publish("all", JSON.stringify({ event, data }));
    }
}
