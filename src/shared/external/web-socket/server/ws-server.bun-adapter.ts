import type { Socket, WsServer } from "../../../infrastructure/web-socket/ws-server";

type Callback = (data: unknown) => void;
type WebsocketData = { headers: Bun.__internal.BunHeadersOverride };

export class WsServerBunAdapter implements WsServer {
    private server?: Bun.Server<WebsocketData>;
    private connectionCallbacks: ((socket: Socket) => void)[] = [];
    private sockets = new WeakMap<Bun.ServerWebSocket<WebsocketData>, Map<string, Callback[]>>();

    readonly websocket: Bun.WebSocketHandler<WebsocketData> = {
        open: (ws) => {
            ws.subscribe("all");
            const handlers = new Map<string, Callback[]>();
            this.sockets.set(ws, handlers);
            const socket: Socket = {
                emit: (event, data) => ws.send(JSON.stringify({ event, data })),
                on: (event, callback) => handlers.set(event, [...(handlers.get(event) ?? []), callback]),
                headers: Object.fromEntries(ws.data.headers),
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

    attatch(server: Bun.Server<WebsocketData>): void {
        this.server = server;
    }

    upgrade(req: Request, server: Bun.Server<WebsocketData>): boolean {
        return server.upgrade(req, {
            data: {
                headers: req.headers,
            },
        });
    }

    on(_event: "connection" | string, callback: (socket: Socket) => void): void {
        this.connectionCallbacks.push(callback);
    }

    emit<T = unknown>(event: string, data: T): void {
        this.server?.publish("all", JSON.stringify({ event, data }));
    }
}
