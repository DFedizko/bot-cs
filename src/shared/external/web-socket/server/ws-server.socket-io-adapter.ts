import type { Socket, WsServer } from "../../../infrastructure/web-socket/ws-server";
import { Server } from "socket.io";
import type { Server as HttpServer } from "node:http";
import type { HttpHeaders } from "@/shared/infrastructure/http/http-headers";

export class WsServerSocketIoAdapter implements WsServer {
    private readonly server: Server;

    constructor(readonly httpServer: HttpServer) {
        this.server = new Server(httpServer);
    }

    on(_event: "connection" | string, callback: (socket: Socket) => void): void {
        this.server.on("connection", (socket) => {
            callback({
                emit: (event, data) => socket.emit(event, data),
                on: (event, callback) => socket.on(event, callback),
                headers: socket.handshake.headers as HttpHeaders,
            });
        });
    }

    emit<T = unknown>(event: string, data: T): void {
        this.server.emit(event, data);
    }
}
